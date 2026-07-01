import { AlertTriangle, CalendarX, ChefHat, ReceiptText, Truck, Users } from "lucide-react";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import type { AuditLogEntry, Customer, DailyMenu, DeliveryRecord, Invoice, PauseRequest } from "../types/domain";
import { formatMoney } from "../utils/billing";
import { formatLongDate } from "../utils/dates";
import { getPackingConflicts, isVegetarianCustomer } from "../utils/packing";

export function Dashboard({
  customers,
  deliveries,
  pauseRequests,
  invoices,
  dailyMenus,
  auditLogs,
  today,
  tomorrow,
}: {
  customers: Customer[];
  deliveries: DeliveryRecord[];
  pauseRequests: PauseRequest[];
  invoices: Invoice[];
  dailyMenus: DailyMenu[];
  auditLogs: AuditLogEntry[];
  today: string;
  tomorrow: string;
}) {
  const todayDeliveries = deliveries.filter((delivery) => delivery.date === today);
  const activeToday = todayDeliveries.filter((delivery) => delivery.status === "scheduled");
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const menu = dailyMenus.find((item) => item.date === today);
  const conflicts = getPackingConflicts(customers, deliveries, menu);
  const pausedTomorrow = pauseRequests.filter((request) => request.status === "applied" && request.startDate <= tomorrow && request.endDate >= tomorrow);
  const unpaidInvoices = invoices.filter((invoice) => invoice.balanceDue > 0 && invoice.status !== "void");
  const activeCustomers = activeToday.map((delivery) => customerById.get(delivery.customerId)).filter(Boolean) as Customer[];

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Truck} label="Active Today" value={activeToday.length} detail={formatLongDate(today)} />
        <StatCard icon={CalendarX} label="Paused Tomorrow" value={pausedTomorrow.length} tone="brass" detail={formatLongDate(tomorrow)} />
        <StatCard icon={AlertTriangle} label="Restrictions Today" value={conflicts.length} tone={conflicts.length ? "spice" : "leaf"} />
        <StatCard icon={ReceiptText} label="Invoices Due" value={unpaidInvoices.length} tone="ink" detail={formatMoney(unpaidInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0))} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <div>
              <p className="label">Prep Summary</p>
              <h2 className="font-black">Today’s tiffins</h2>
            </div>
            <ChefHat className="h-5 w-5 text-leaf" />
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <MiniMetric label="Total" value={activeCustomers.length} />
            <MiniMetric label="Vegetarian" value={activeCustomers.filter(isVegetarianCustomer).length} />
            <MiniMetric label="Non-Veg" value={activeCustomers.filter((customer) => !isVegetarianCustomer(customer)).length} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-coconut text-left text-xs uppercase text-ink/55">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3">Meal</th>
                  <th className="px-4 py-3">Restrictions</th>
                  <th className="px-4 py-3">Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {activeToday.map((delivery) => {
                  const customer = customerById.get(delivery.customerId);
                  if (!customer) return null;
                  return (
                    <tr key={delivery.id} className="bg-white">
                      <td className="px-4 py-3 font-semibold">{customer.name}</td>
                      <td className="px-4 py-3 text-ink/65">{customer.address.zone}</td>
                      <td className="px-4 py-3 capitalize">{delivery.mealType}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {customer.preferences.slice(0, 3).map((preference) => (
                            <Badge key={preference.id} tone={preference.type === "allergy" ? "red" : "neutral"}>
                              {preference.tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">{customer.address.routeOrder ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-5">
          <section className="panel p-4">
            <p className="label">Food Alerts</p>
            <div className="mt-3 grid gap-3">
              {conflicts.length ? (
                conflicts.slice(0, 5).map((conflict) => (
                  <div className="rounded-md border border-spice/20 bg-spice/5 p-3" key={`${conflict.customer.id}-${conflict.itemName}-${conflict.blockedTag}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">{conflict.customer.name}</p>
                      <Badge tone={conflict.type === "allergy" ? "red" : "amber"}>{conflict.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink/65">
                      {conflict.itemName}: {conflict.reason}
                    </p>
                    {conflict.substitute ? <p className="mt-1 text-sm font-semibold text-leaf">Substitute: {conflict.substitute}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink/60">No menu conflicts for today.</p>
              )}
            </div>
          </section>

          <section className="panel p-4">
            <p className="label">Recent Audit</p>
            <div className="mt-3 grid gap-3">
              {auditLogs.slice(0, 4).map((entry) => (
                <div key={entry.id} className="border-l-2 border-leaf pl-3">
                  <p className="text-sm font-bold">{entry.action}</p>
                  <p className="text-sm text-ink/60">{entry.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-black/10 bg-coconut p-3">
      <p className="label">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
