import { BarChart3, CircleDollarSign, PackageCheck, PauseCircle, Users } from "lucide-react";
import { StatCard } from "../components/StatCard";
import type { Customer, DeliveryRecord, Invoice } from "../types/domain";
import { formatMoney } from "../utils/billing";

export function Reports({
  customers,
  deliveries,
  invoices,
}: {
  customers: Customer[];
  deliveries: DeliveryRecord[];
  invoices: Invoice[];
}) {
  const delivered = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const skipped = deliveries.filter((delivery) => ["skipped", "customer_pause", "cancelled_before_prep"].includes(delivery.status)).length;
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.totalDue, 0);
  const unpaid = invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active Customers" value={customers.filter((customer) => customer.status === "active").length} />
        <StatCard icon={PackageCheck} label="Delivered Records" value={delivered} />
        <StatCard icon={PauseCircle} label="Skipped Records" value={skipped} tone="brass" />
        <StatCard icon={CircleDollarSign} label="Unpaid Balance" value={formatMoney(unpaid)} tone="spice" />
      </section>

      <section className="panel p-4">
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-leaf" />
          <h2 className="font-black">Monthly Snapshot</h2>
        </div>
        <div className="grid gap-3">
          {[
            ["Delivered", delivered, "bg-leaf"],
            ["Skipped / pause", skipped, "bg-brass"],
            ["Failed", deliveries.filter((delivery) => delivery.status === "failed").length, "bg-spice"],
            ["Invoice revenue", revenue, "bg-ink"],
          ].map(([label, value, color]) => (
            <div key={label} className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{label}</span>
                <span>{typeof value === "number" && label === "Invoice revenue" ? formatMoney(value) : value}</span>
              </div>
              <div className="h-2 rounded-full bg-black/10">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, Number(value) * 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
