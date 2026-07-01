import { Download, Github, Save, Shield, Users } from "lucide-react";
import type { AppUser, Customer, DeliveryRecord, Invoice, PauseRequest, Settings as SettingsType } from "../types/domain";
import { downloadExcelBackup } from "../utils/excelImportExport";
import { validateSettings } from "../utils/validation";

export function Settings({
  settings,
  users,
  customers,
  deliveries,
  pauseRequests,
  invoices,
  onChange,
}: {
  settings: SettingsType;
  users: AppUser[];
  customers: Customer[];
  deliveries: DeliveryRecord[];
  pauseRequests: PauseRequest[];
  invoices: Invoice[];
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
          </div>
        </SettingsPanel>

        <SettingsPanel title="Pricing, Tax, Discounts" icon={Save}>
          <div className="grid gap-4 md:grid-cols-3">
            <NumberInput label="Default price" value={settings.pricing.defaultPricePerTiffin} onChange={(value) => onChange({ ...settings, pricing: { ...settings.pricing, defaultPricePerTiffin: value } })} />
            <NumberInput label="Lunch rate" value={settings.pricing.lunchRate} onChange={(value) => onChange({ ...settings, pricing: { ...settings.pricing, lunchRate: value } })} />
            <NumberInput label="Dinner rate" value={settings.pricing.dinnerRate} onChange={(value) => onChange({ ...settings, pricing: { ...settings.pricing, dinnerRate: value } })} />
            <label className="grid gap-1">
              <span className="label">Tax mode</span>
              <select className="input" value={settings.tax.mode} onChange={(event) => onChange({ ...settings, tax: { ...settings.tax, mode: event.target.value as SettingsType["tax"]["mode"] } })}>
                <option value="no_tax">No tax</option>
                <option value="tax_exclusive">Tax exclusive</option>
                <option value="tax_inclusive">Tax inclusive</option>
              </select>
            </label>
            <NumberInput label="Tax rate" value={settings.tax.rate} step={0.01} onChange={(value) => onChange({ ...settings, tax: { ...settings.tax, rate: value } })} />
            <NumberInput label="Max discount %" value={settings.discounts.maxPercent} onChange={(value) => onChange({ ...settings, discounts: { ...settings.discounts, maxPercent: value } })} />
          </div>
        </SettingsPanel>

        <SettingsPanel title="Invoice and GitHub Sync" icon={Github}>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Invoice prefix" value={settings.invoice.prefix} onChange={(value) => onChange({ ...settings, invoice: { ...settings.invoice, prefix: value } })} />
            <NumberInput label="Next number" value={settings.invoice.nextNumber} onChange={(value) => onChange({ ...settings, invoice: { ...settings.invoice, nextNumber: value } })} />
            <NumberInput label="Due days" value={settings.invoice.dueDays} onChange={(value) => onChange({ ...settings, invoice: { ...settings.invoice, dueDays: value } })} />
            <Input label="Data owner" value={settings.github.owner} onChange={(value) => onChange({ ...settings, github: { ...settings.github, owner: value } })} />
            <Input label="Data repo" value={settings.github.repo} onChange={(value) => onChange({ ...settings, github: { ...settings.github, repo: value } })} />
            <Input label="Branch" value={settings.github.branch} onChange={(value) => onChange({ ...settings, github: { ...settings.github, branch: value } })} />
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

        <section className="panel p-4">
          <p className="label">Backup</p>
          <button className="secondary-button mt-3 w-full" onClick={() => void downloadExcelBackup({ settings, customers, deliveries, pauseRequests, invoices })}>
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </section>

        {errors.length ? <section className="rounded-md border border-spice/25 bg-spice/10 p-4 text-sm font-semibold text-spice">{errors.join(" ")}</section> : null}
      </aside>
    </div>
  );
}

function SettingsPanel({ title, icon: Icon, children }: { title: string; icon: typeof Save; children: React.ReactNode }) {
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

function NumberInput({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input className="input" type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
