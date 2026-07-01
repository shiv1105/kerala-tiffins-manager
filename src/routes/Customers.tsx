import { CalendarPlus, Edit3, Plus, ReceiptText, Search, ToggleLeft, ToggleRight, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { CustomerForm } from "../components/CustomerForm";
import type { Customer, PauseRequest } from "../types/domain";
import { formatMoney } from "../utils/billing";
import { formatLongDate } from "../utils/dates";
import { validateCustomer } from "../utils/validation";

export function Customers({
  customers,
  onSave,
  onCreatePause,
  onGenerateInvoice,
}: {
  customers: Customer[];
  onSave: (customer: Customer) => void;
  onCreatePause: (pause: PauseRequest) => void;
  onGenerateInvoice: (customerId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      customers.filter((customer) => {
        const matchesQuery = [customer.name, customer.phone, customer.address.zone, customer.code].join(" ").toLowerCase().includes(query.toLowerCase());
        const matchesStatus = status === "all" || customer.status === status;
        return matchesQuery && matchesStatus;
      }),
    [customers, query, status],
  );

  const startNew = () => {
    setEditing({
      id: `cust_${crypto.randomUUID()}`,
      code: `KT-${String(customers.length + 1).padStart(3, "0")}`,
      status: "active",
      name: "",
      phone: "",
      email: "",
      preferredContact: "phone",
      address: { street: "", city: "Scarborough", postalCode: "", zone: "Scarborough" },
      plan: {
        type: "monthly",
        mealType: "lunch",
        startDate: new Date().toISOString().slice(0, 10),
        deliveryDays: ["mon", "tue", "wed", "thu", "fri"],
        defaultRate: 12,
        billingCycle: "monthly",
        customerDiscountType: "none",
        customerDiscountValue: 0,
      },
      preferences: [],
      notes: {},
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setErrors([]);
  };

  const saveEditing = () => {
    if (!editing) return;
    const nextErrors = validateCustomer(editing);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    onSave({ ...editing, updatedAt: new Date().toISOString() });
    setEditing(null);
  };

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input className="input pl-9" placeholder="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <select className="input w-36" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Inactive</option>
          </select>
        </div>
        <button className="primary-button" onClick={startNew}>
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-coconut text-left text-xs uppercase text-ink/55">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Restrictions</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-leaf" />
                      <div>
                        <p className="font-bold">{customer.name}</p>
                        <p className="text-xs text-ink/50">{customer.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.address.zone}</td>
                  <td className="px-4 py-3 capitalize">{customer.plan.type} / {customer.plan.mealType}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={customer.status === "active" ? "green" : customer.status === "paused" ? "amber" : "neutral"}>
                        {customer.status === "archived" ? "inactive" : customer.status}
                      </Badge>
                      <button
                        className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-bold transition ${
                          customer.status === "active"
                            ? "border-leaf/25 bg-leaf/10 text-leaf hover:bg-leaf/15"
                            : "border-black/10 bg-white text-ink/70 hover:border-leaf/35 hover:text-leaf"
                        }`}
                        onClick={() => onSave({ ...customer, status: customer.status === "active" ? "archived" : "active", updatedAt: new Date().toISOString() })}
                        aria-label={`${customer.status === "active" ? "Deactivate" : "Activate"} ${customer.name}`}
                      >
                        {customer.status === "active" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {customer.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{customer.preferences.length}</td>
                  <td className="px-4 py-3">{formatMoney(customer.plan.defaultRate)}</td>
                  <td className="px-4 py-3">{formatMoney(customer.outstandingBalance)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="icon-button" onClick={() => setEditing(customer)} aria-label={`Edit ${customer.name}`}>
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="icon-button" onClick={() => onGenerateInvoice(customer.id)} aria-label={`Generate invoice for ${customer.name}`}>
                        <ReceiptText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-ink/40 p-4">
          <section className="panel mx-auto my-4 max-w-5xl p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="label">Customer Profile</p>
                <h2 className="text-xl font-black">{editing.name || "New Customer"}</h2>
              </div>
              <div className="flex gap-2">
                <button className="secondary-button" onClick={() => setEditing(null)}>Cancel</button>
                <button className="primary-button" onClick={saveEditing}>Save</button>
              </div>
            </div>
            {errors.length ? (
              <div className="mb-4 rounded-md border border-spice/25 bg-spice/10 p-3 text-sm font-semibold text-spice">
                {errors.join(" ")}
              </div>
            ) : null}
            <CustomerForm customer={editing} onChange={setEditing} />
            {customers.some((customer) => customer.id === editing.id) ? <CustomerPausePanel customer={editing} onCreatePause={onCreatePause} /> : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function CustomerPausePanel({
  customer,
  onCreatePause,
}: {
  customer: Customer;
  onCreatePause: (pause: PauseRequest) => void;
}) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(tomorrow);
  const [reason, setReason] = useState("Customer pause");
  const [lastApplied, setLastApplied] = useState<string | null>(null);
  const isInvalid = endDate < startDate;

  const applyPause = () => {
    if (isInvalid) return;
    onCreatePause({
      id: `pause_${crypto.randomUUID()}`,
      customerId: customer.id,
      startDate,
      endDate,
      reason: reason.trim() || "Customer pause",
      source: "phone",
      status: "applied",
      createdBy: "Owner",
      createdAt: new Date().toISOString(),
    });
    setLastApplied(startDate === endDate ? formatLongDate(startDate) : `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`);
  };

  return (
    <section className="mt-5 rounded-md border border-brass/25 bg-brass/5 p-4">
      <div className="mb-4 flex items-center gap-2">
        <CalendarPlus className="h-5 w-5 text-[#7a5b15]" />
        <div>
          <p className="label">Pause Service</p>
          <h3 className="font-black">Add tiffin pause for {customer.name}</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-end">
        <label className="grid gap-1">
          <span className="label">From</span>
          <input className="input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="label">To</span>
          <input className="input" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="label">Reason</span>
          <input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Travel, vacation, family event" />
        </label>
        <button className="primary-button md:w-32" onClick={applyPause} disabled={isInvalid}>
          Apply Pause
        </button>
      </div>
      {isInvalid ? <p className="mt-2 text-sm font-semibold text-spice">To date must be after From date.</p> : null}
      {lastApplied ? <p className="mt-2 text-sm font-semibold text-leaf">Pause applied: {lastApplied}</p> : null}
    </section>
  );
}
