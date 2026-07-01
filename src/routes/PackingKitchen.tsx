import { AlertOctagon, CheckSquare, Printer, Utensils } from "lucide-react";
import { Badge } from "../components/Badge";
import type { Customer, DailyMenu, DeliveryRecord } from "../types/domain";
import { getPackingConflicts } from "../utils/packing";

export function PackingKitchen({
  customers,
  deliveries,
  dailyMenus,
  today,
}: {
  customers: Customer[];
  deliveries: DeliveryRecord[];
  dailyMenus: DailyMenu[];
  today: string;
}) {
  const menu = dailyMenus.find((item) => item.date === today);
  const conflicts = getPackingConflicts(customers, deliveries, menu);
  const activeIds = new Set(deliveries.filter((delivery) => delivery.date === today && delivery.status === "scheduled").map((delivery) => delivery.customerId));
  const activeCustomers = customers.filter((customer) => activeIds.has(customer.id));

  return (
    <div className="grid gap-5">
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label">Menu</p>
            <h2 className="font-black">{menu?.items.map((item) => item.name).join(" / ") ?? "No menu selected"}</h2>
          </div>
          <button className="secondary-button" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          <div className="rounded-md border border-black/10 bg-coconut p-4">
            <Utensils className="mb-3 h-5 w-5 text-leaf" />
            <p className="label">Meal Count</p>
            <p className="mt-1 text-3xl font-black">{activeCustomers.length}</p>
          </div>
          <div className="rounded-md border border-spice/20 bg-spice/5 p-4">
            <AlertOctagon className="mb-3 h-5 w-5 text-spice" />
            <p className="label">Critical Warnings</p>
            <p className="mt-1 text-3xl font-black">{conflicts.filter((conflict) => conflict.type === "allergy" || conflict.severity === "critical").length}</p>
          </div>
          <div className="rounded-md border border-brass/30 bg-brass/10 p-4">
            <CheckSquare className="mb-3 h-5 w-5 text-[#7a5b15]" />
            <p className="label">Substitutions</p>
            <p className="mt-1 text-3xl font-black">{conflicts.filter((conflict) => conflict.substitute).length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-black/10 px-4 py-3">
            <p className="label">Restriction Alerts</p>
            <h2 className="font-black">Before packing</h2>
          </div>
          <div className="divide-y divide-black/10">
            {conflicts.map((conflict) => (
              <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_9rem]" key={`${conflict.customer.id}-${conflict.itemName}-${conflict.blockedTag}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black">{conflict.customer.name}</p>
                    <Badge tone={conflict.type === "allergy" ? "red" : "amber"}>{conflict.type}</Badge>
                    <Badge>{conflict.blockedTag}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">{conflict.itemName}: {conflict.reason}</p>
                  <p className="mt-1 text-sm font-semibold text-leaf">{conflict.substitute ? `Substitute ${conflict.substitute}` : "Staff acknowledgement required"}</p>
                </div>
                <label className="flex h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold">
                  <input type="checkbox" />
                  Checked
                </label>
              </div>
            ))}
            {!conflicts.length ? <p className="p-4 text-sm text-ink/60">No conflicts for the selected menu.</p> : null}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-black/10 px-4 py-3">
            <p className="label">Packing Sheet</p>
            <h2 className="font-black">Active customers</h2>
          </div>
          <div className="divide-y divide-black/10">
            {activeCustomers.map((customer) => (
              <div key={customer.id} className="grid gap-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{customer.name}</p>
                  <Badge tone={customer.preferences.some((preference) => preference.type === "allergy") ? "red" : "neutral"}>
                    {customer.plan.mealType}
                  </Badge>
                </div>
                <p className="text-sm text-ink/60">{customer.notes.packing ?? customer.notes.kitchen ?? "Standard packing"}</p>
                {customer.preferences.some((preference) => preference.type === "dislike" && preference.substituteTag) ? (
                  <div className="flex flex-wrap gap-2">
                    {customer.preferences
                      .filter((preference) => preference.type === "dislike" && preference.substituteTag)
                      .map((preference) => (
                        <Badge key={preference.id} tone="amber">
                          No {preference.tag}: substitute {preference.substituteTag}
                        </Badge>
                      ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
