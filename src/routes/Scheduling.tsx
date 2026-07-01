import { CalendarPlus, CheckCircle2, CircleX, PauseCircle, Truck } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/Badge";
import type { Customer, DeliveryRecord, PauseRequest } from "../types/domain";
import { formatLongDate } from "../utils/dates";

export function Scheduling({
  customers,
  deliveries,
  pauseRequests,
  today,
  tomorrow,
  onUpdateDelivery,
  onCreatePause,
}: {
  customers: Customer[];
  deliveries: DeliveryRecord[];
  pauseRequests: PauseRequest[];
  today: string;
  tomorrow: string;
  onUpdateDelivery: (delivery: DeliveryRecord) => void;
  onCreatePause: (pause: PauseRequest) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [pauseCustomer, setPauseCustomer] = useState(customers[0]?.id ?? "");
  const [pauseStartDate, setPauseStartDate] = useState(tomorrow);
  const [pauseEndDate, setPauseEndDate] = useState(tomorrow);
  const [pauseReason, setPauseReason] = useState("Customer pause");
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const dayRows = deliveries.filter((delivery) => delivery.date === selectedDate);
  const pauseDateInvalid = pauseEndDate < pauseStartDate;

  const addPause = () => {
    if (!pauseCustomer || pauseDateInvalid) return;
    onCreatePause({
      id: `pause_${crypto.randomUUID()}`,
      customerId: pauseCustomer,
      startDate: pauseStartDate,
      endDate: pauseEndDate,
      reason: pauseReason.trim() || "Customer pause",
      source: "whatsapp",
      status: "applied",
      createdBy: "Owner",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-black/10 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label">Daily Schedule</p>
            <h2 className="font-black">{formatLongDate(selectedDate)}</h2>
          </div>
          <input className="input w-full sm:w-44" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-coconut text-left text-xs uppercase text-ink/55">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Meal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {dayRows.map((delivery) => {
                const customer = customerById.get(delivery.customerId);
                return (
                  <tr key={delivery.id}>
                    <td className="px-4 py-3 font-semibold">{customer?.name ?? delivery.customerId}</td>
                    <td className="px-4 py-3 capitalize">{delivery.mealType}</td>
                    <td className="px-4 py-3">
                      <Badge tone={delivery.status === "delivered" ? "green" : delivery.status.includes("pause") || delivery.status === "skipped" ? "amber" : delivery.status === "failed" ? "red" : "neutral"}>
                        {delivery.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink/65">{delivery.reason ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="icon-button" onClick={() => onUpdateDelivery({ ...delivery, status: "delivered", markedAt: new Date().toISOString(), markedBy: "Delivery" })} aria-label="Mark delivered">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button className="icon-button" onClick={() => onUpdateDelivery({ ...delivery, status: "failed", reason: "Customer unavailable", markedAt: new Date().toISOString(), markedBy: "Delivery" })} aria-label="Mark failed">
                          <CircleX className="h-4 w-4" />
                        </button>
                        <button className="icon-button" onClick={() => onUpdateDelivery({ ...delivery, status: "customer_pause", reason: "Customer pause", markedAt: new Date().toISOString(), markedBy: "Operations" })} aria-label="Mark pause">
                          <PauseCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="grid gap-5 content-start">
        <section className="panel p-4">
          <div className="mb-4 flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-leaf" />
            <h2 className="font-black">Create Pause</h2>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="label">Customer</span>
              <select className="input" value={pauseCustomer} onChange={(event) => setPauseCustomer(event.target.value)}>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="grid gap-1">
                <span className="label">From</span>
                <input className="input" type="date" value={pauseStartDate} onChange={(event) => setPauseStartDate(event.target.value)} />
              </label>
              <label className="grid gap-1">
                <span className="label">To</span>
                <input className="input" type="date" value={pauseEndDate} onChange={(event) => setPauseEndDate(event.target.value)} />
              </label>
            </div>
            <label className="grid gap-1">
              <span className="label">Reason</span>
              <input className="input" value={pauseReason} onChange={(event) => setPauseReason(event.target.value)} placeholder="Travel, family event, vacation" />
            </label>
            {pauseDateInvalid ? <p className="text-sm font-semibold text-spice">To date must be after From date.</p> : null}
            <button className="primary-button" onClick={addPause} disabled={pauseDateInvalid || !pauseCustomer}>
              Apply Pause
            </button>
          </div>
        </section>

        <section className="panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-leaf" />
            <h2 className="font-black">Paused Tomorrow</h2>
          </div>
          <div className="grid gap-2">
            {pauseRequests
              .filter((pause) => pause.status === "applied" && pause.startDate <= tomorrow && pause.endDate >= tomorrow)
              .map((pause) => (
                <div key={pause.id} className="rounded-md border border-black/10 bg-coconut p-3">
                  <p className="font-bold">{customerById.get(pause.customerId)?.name}</p>
                  <p className="text-sm text-ink/60">{pause.reason}</p>
                  <p className="mt-1 text-xs font-semibold text-ink/50">
                    {pause.startDate === pause.endDate ? formatLongDate(pause.startDate) : `${formatLongDate(pause.startDate)} to ${formatLongDate(pause.endDate)}`}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
