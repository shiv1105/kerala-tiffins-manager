import { Shield, Users } from "lucide-react";
import type { AppUser, Settings as SettingsType } from "../types/domain";
import { validateSettings } from "../utils/validation";

export function Settings({
  settings,
  users,
  onChange,
}: {
  settings: SettingsType;
  users: AppUser[];
  onChange: (settings: SettingsType) => void;
}) {
  const errors = validateSettings(settings);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="grid gap-5">
        <SettingsPanel title="Business Profile" icon={Shield}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Business name" value={settings.business.name} onChange={(value) => onChange({ ...settings, business: { ...settings.business, name: value } })} />
            <Input label="Phone" value={settings.business.phone} onChange={(value) => onChange({ ...settings, business: { ...settings.business, phone: value } })} />
            <Input label="Email" value={settings.business.email} onChange={(value) => onChange({ ...settings, business: { ...settings.business, email: value } })} />
            <Input label="Address" value={settings.business.address} onChange={(value) => onChange({ ...settings, business: { ...settings.business, address: value } })} />
            <label className="grid gap-1 md:col-span-2">
              <span className="label">Invoice footer note</span>
              <input
                className="input"
                value={settings.business.invoiceFooterNote}
                onChange={(event) => onChange({ ...settings, business: { ...settings.business, invoiceFooterNote: event.target.value } })}
              />
            </label>
          </div>
        </SettingsPanel>
      </section>

      <aside className="grid gap-5 content-start">
        <section className="panel p-4">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-leaf" />
            <h2 className="font-black">Users</h2>
          </div>
          <div className="grid gap-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-md border border-black/10 bg-coconut p-3">
                <p className="font-bold">{user.name}</p>
                <p className="text-xs capitalize text-ink/60">{user.role}</p>
              </div>
            ))}
          </div>
        </section>

        {errors.length ? <section className="rounded-md border border-spice/25 bg-spice/10 p-4 text-sm font-semibold text-spice">{errors.join(" ")}</section> : null}
      </aside>
    </div>
  );
}

function SettingsPanel({ title, icon: Icon, children }: { title: string; icon: typeof Shield; children: React.ReactNode }) {
  return (
    <section className="panel p-4">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-leaf" />
        <h2 className="font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input className="input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
