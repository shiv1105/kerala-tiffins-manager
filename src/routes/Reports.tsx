import {
  BarChart3,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  PackageCheck,
  PauseCircle,
  ReceiptText,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import type { Customer, DeliveryRecord, Invoice } from "../types/domain";
import { formatMoney } from "../utils/billing";
import { downloadReportWorkbook } from "../utils/excelImportExport";

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
  const activeCustomers = customers.filter((customer) => customer.status === "active");

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active Customers" value={activeCustomers.length} />
        <StatCard icon={PackageCheck} label="Delivered Records" value={delivered} />
        <StatCard icon={PauseCircle} label="Skipped Records" value={skipped} tone="brass" />
        <StatCard icon={CircleDollarSign} label="Unpaid Balance" value={formatMoney(unpaid)} tone="spice" />
      </section>

      <section className="panel p-4">
        <div className="mb-5 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-leaf" />
          <h2 className="font-black">Download Lists</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <ReportButton
            icon={Users}
            title="All Customers"
            description="Full customer contact, address, status, plan, and rate list."
            onClick={() => void downloadReportWorkbook(buildCustomerRows(customers), "Customers", "all_customers")}
          />
          <ReportButton
            icon={Utensils}
            title="Dietary Restrictions"
            description="All allergies, dislikes, dietary notes, spice levels, and substitutes."
            onClick={() => void downloadReportWorkbook(buildRestrictionRows(customers), "Dietary Restrictions", "dietary_restrictions")}
          />
          <ReportButton
            icon={PackageCheck}
            title="Packing Notes"
            description="Kitchen and packing notes for active customers."
            onClick={() => void downloadReportWorkbook(buildPackingRows(activeCustomers), "Packing Notes", "packing_notes")}
          />
          <ReportButton
            icon={Truck}
            title="Delivery Route"
            description="Route order, zone, address, and delivery instructions."
            onClick={() => void downloadReportWorkbook(buildDeliveryRows(activeCustomers), "Delivery Route", "delivery_route")}
          />
          <ReportButton
            icon={ReceiptText}
            title="Customer Rates"
            description="Per-customer tiffin price and billing setup."
            onClick={() => void downloadReportWorkbook(buildRateRows(customers), "Customer Rates", "customer_rates")}
          />
          <ReportButton
            icon={PauseCircle}
            title="Inactive Customers"
            description="Paused, cancelled, archived, and deactivated customer accounts."
            onClick={() => void downloadReportWorkbook(buildInactiveRows(customers), "Inactive Customers", "inactive_customers")}
          />
        </div>
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

function ReportButton({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="rounded-md border border-black/10 bg-white p-4 text-left transition hover:border-leaf/40 hover:bg-leaf/5" onClick={onClick}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-leaf" />
        <Download className="h-4 w-4 text-ink/45" />
      </div>
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm leading-5 text-ink/60">{description}</p>
    </button>
  );
}

function buildCustomerRows(customers: Customer[]) {
  return customers.map((customer) => ({
    Code: customer.code,
    Name: customer.name,
    Phone: customer.phone,
    Email: customer.email ?? "",
    Status: customer.status,
    "Meal Type": customer.plan.mealType,
    "Rate Per Tiffin": customer.plan.defaultRate,
    Zone: customer.address.zone,
    Address: formatAddress(customer),
    "Route Order": customer.address.routeOrder ?? "",
    "Delivery Instructions": customer.address.deliveryInstructions ?? "",
    "Kitchen Notes": customer.notes.kitchen ?? "",
    "Packing Notes": customer.notes.packing ?? "",
  }));
}

function buildRestrictionRows(customers: Customer[]) {
  return customers.flatMap((customer) =>
    customer.preferences.map((preference) => ({
      Code: customer.code,
      Name: customer.name,
      Phone: customer.phone,
      Status: customer.status,
      Type: preference.type,
      Item: preference.tag,
      Severity: preference.type === "dislike" ? "" : preference.severity,
      Substitute: preference.substituteTag ?? "",
      Notes: preference.notes ?? "",
      "Kitchen Notes": customer.notes.kitchen ?? "",
      "Packing Notes": customer.notes.packing ?? "",
    })),
  );
}

function buildPackingRows(customers: Customer[]) {
  return customers.map((customer) => ({
    Code: customer.code,
    Name: customer.name,
    "Meal Type": customer.plan.mealType,
    "Kitchen Notes": customer.notes.kitchen ?? "",
    "Packing Notes": customer.notes.packing ?? "",
    Restrictions: customer.preferences.map((preference) => `${preference.type}: ${preference.tag}${preference.substituteTag ? ` -> ${preference.substituteTag}` : ""}`).join("; "),
  }));
}

function buildDeliveryRows(customers: Customer[]) {
  return [...customers]
    .sort((a, b) => (a.address.routeOrder ?? 9999) - (b.address.routeOrder ?? 9999))
    .map((customer) => ({
      "Route Order": customer.address.routeOrder ?? "",
      Code: customer.code,
      Name: customer.name,
      Phone: customer.phone,
      Zone: customer.address.zone,
      Address: formatAddress(customer),
      Instructions: customer.address.deliveryInstructions ?? "",
    }));
}

function buildRateRows(customers: Customer[]) {
  return customers.map((customer) => ({
    Code: customer.code,
    Name: customer.name,
    Status: customer.status,
    "Plan Type": customer.plan.type,
    "Meal Type": customer.plan.mealType,
    "Rate Per Tiffin": customer.plan.defaultRate,
    "Billing Cycle": customer.plan.billingCycle,
    "Discount Type": customer.plan.customerDiscountType,
    "Discount Value": customer.plan.customerDiscountValue,
    Balance: customer.outstandingBalance,
  }));
}

function buildInactiveRows(customers: Customer[]) {
  return customers
    .filter((customer) => customer.status !== "active")
    .map((customer) => ({
      Code: customer.code,
      Name: customer.name,
      Phone: customer.phone,
      Status: customer.status,
      Zone: customer.address.zone,
      "Admin Notes": customer.notes.admin ?? "",
    }));
}

function formatAddress(customer: Customer) {
  return `${customer.address.street}${customer.address.unit ? `, ${customer.address.unit}` : ""}, ${customer.address.city} ${customer.address.postalCode}`.trim();
}
