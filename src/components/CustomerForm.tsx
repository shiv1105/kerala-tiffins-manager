import { Plus, Trash2 } from "lucide-react";
import type { Customer, FoodPreference } from "../types/domain";

export function CustomerForm({
  customer,
  onChange,
}: {
  customer: Customer;
  onChange: (customer: Customer) => void;
}) {
  const updatePreference = (id: string, patch: Partial<FoodPreference>) => {
    onChange({
      ...customer,
      preferences: customer.preferences.map((preference) => (preference.id === id ? { ...preference, ...patch } : preference)),
    });
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="label">Name</span>
          <input className="input" value={customer.name} onChange={(event) => onChange({ ...customer, name: event.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="label">Phone</span>
          <input className="input" value={customer.phone} onChange={(event) => onChange({ ...customer, phone: event.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="input" value={customer.email ?? ""} onChange={(event) => onChange({ ...customer, email: event.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="label">Status</span>
          <select className="input" value={customer.status} onChange={(event) => onChange({ ...customer, status: event.target.value as Customer["status"] })}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 md:col-span-2">
          <span className="label">Street address</span>
          <input
            className="input"
            value={customer.address.street}
            onChange={(event) => onChange({ ...customer, address: { ...customer.address, street: event.target.value } })}
          />
        </label>
        <label className="grid gap-1">
          <span className="label">Unit</span>
          <input
            className="input"
            value={customer.address.unit ?? ""}
            onChange={(event) => onChange({ ...customer, address: { ...customer.address, unit: event.target.value } })}
          />
        </label>
        <label className="grid gap-1">
          <span className="label">Zone</span>
          <input
            className="input"
            value={customer.address.zone}
            onChange={(event) => onChange({ ...customer, address: { ...customer.address, zone: event.target.value } })}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="label">Meal</span>
          <select
            className="input"
            value={customer.plan.mealType}
            onChange={(event) => onChange({ ...customer, plan: { ...customer.plan, mealType: event.target.value as Customer["plan"]["mealType"] } })}
          >
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="label">Rate</span>
          <input
            className="input"
            type="number"
            min="0"
            value={customer.plan.defaultRate}
            onChange={(event) => onChange({ ...customer, plan: { ...customer.plan, defaultRate: Number(event.target.value) } })}
          />
        </label>
        <label className="grid gap-1">
          <span className="label">Balance</span>
          <input
            className="input"
            type="number"
            value={customer.outstandingBalance}
            onChange={(event) => onChange({ ...customer, outstandingBalance: Number(event.target.value) })}
          />
        </label>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-black">Food Preferences</h3>
          <button
            className="secondary-button h-9"
            onClick={() =>
              onChange({
                ...customer,
                preferences: [
                  ...customer.preferences,
                  {
                    id: `pref_${crypto.randomUUID()}`,
                    type: "dislike",
                    tag: "",
                    severity: "medium",
                    substituteTag: "",
                  },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="grid gap-2">
          {customer.preferences.map((preference) => (
            <div className="grid gap-2 rounded-md border border-black/10 bg-coconut p-3 md:grid-cols-[9rem_1fr_10rem_1fr_2.5rem]" key={preference.id}>
              <select className="input" value={preference.type} onChange={(event) => updatePreference(preference.id, { type: event.target.value as FoodPreference["type"] })}>
                <option value="like">Like</option>
                <option value="dislike">Dislike</option>
                <option value="allergy">Allergy</option>
                <option value="dietary">Dietary</option>
                <option value="spice_level">Spice</option>
                <option value="substitution">Substitution</option>
              </select>
              <input className="input" placeholder="Tag" value={preference.tag} onChange={(event) => updatePreference(preference.id, { tag: event.target.value })} />
              {preference.type === "dislike" ? (
                <input
                  className="input"
                  placeholder="Substitute"
                  value={preference.substituteTag ?? ""}
                  onChange={(event) => updatePreference(preference.id, { substituteTag: event.target.value })}
                />
              ) : (
                <select
                  className="input"
                  value={preference.severity}
                  onChange={(event) => updatePreference(preference.id, { severity: event.target.value as FoodPreference["severity"] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              )}
              <input className="input" placeholder="Notes" value={preference.notes ?? ""} onChange={(event) => updatePreference(preference.id, { notes: event.target.value })} />
              <button
                className="icon-button"
                onClick={() => onChange({ ...customer, preferences: customer.preferences.filter((item) => item.id !== preference.id) })}
                aria-label="Remove preference"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
