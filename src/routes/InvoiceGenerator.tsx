import { Download, Printer, Save } from "lucide-react";
import { useMemo, useState } from "react";
import type { Customer, DiscountType, Invoice, Settings, TaxMode } from "../types/domain";
import { calculateManualInvoice, formatMoney } from "../utils/billing";
import { downloadInvoicePdf } from "../utils/pdfInvoice";

export function InvoiceGenerator({
  customers,
  settings,
  selectedCustomerId,
  onSaveInvoice,
}: {
  customers: Customer[];
  settings: Settings;
  selectedCustomerId?: string;
  onSaveInvoice: (invoice: Invoice) => void;
}) {
  const [customerId, setCustomerId] = useState(selectedCustomerId ?? customers[0]?.id ?? "");
  const customer = customers.find((item) => item.id === customerId) ?? customers[0];
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const [periodStart, setPeriodStart] = useState(monthStart);
  const [periodEnd, setPeriodEnd] = useState(today);
  const [tiffinDays, setTiffinDays] = useState(20);
  const [dailyRate, setDailyRate] = useState(customer?.plan.defaultRate ?? settings.pricing.defaultPricePerTiffin);
  const [discountType, setDiscountType] = useState<DiscountType>(customer?.plan.customerDiscountType ?? "none");
  const [discountValue, setDiscountValue] = useState(customer?.plan.customerDiscountValue ?? 0);
  const [taxMode, setTaxMode] = useState<TaxMode>(settings.tax.mode);
  const [taxRate, setTaxRate] = useState(settings.tax.rate);
  const [paymentsReceived, setPaymentsReceived] = useState(0);

  const calculation = useMemo(
    () =>
      calculateManualInvoice({
        tiffinDays,
        dailyRate,
        discountType,
        discountValue,
        taxMode,
        taxRate,
        paymentsReceived,
        credits: 0,
      }),
    [tiffinDays, dailyRate, discountType, discountValue, taxMode, taxRate, paymentsReceived],
  );

  const invoice = useMemo<Invoice>(() => {
    const invoiceNumber = `${settings.invoice.prefix}-${String(settings.invoice.nextNumber).padStart(4, "0")}`;
    return {
      id: `inv_${crypto.randomUUID()}`,
      invoiceNumber,
      customerId,
      periodStart,
      periodEnd,
      dailyRate,
      discountType,
      discountValue,
      taxMode,
      taxRate,
      status: "draft",
      createdAt: new Date().toISOString(),
      ...calculation,
    };
  }, [settings.invoice.prefix, settings.invoice.nextNumber, customerId, periodStart, periodEnd, dailyRate, discountType, discountValue, taxMode, taxRate, calculation]);

  if (!customer) return null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <section className="panel p-4">
        <div className="mb-5">
          <p className="label">Invoice Generator</p>
          <h2 className="text-xl font-black">Standalone invoice</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 md:col-span-2">
            <span className="label">Customer</span>
            <select
              className="input"
              value={customerId}
              onChange={(event) => {
                const nextCustomer = customers.find((item) => item.id === event.target.value);
                setCustomerId(event.target.value);
                if (nextCustomer) {
                  setDailyRate(nextCustomer.plan.defaultRate);
                  setDiscountType(nextCustomer.plan.customerDiscountType);
                  setDiscountValue(nextCustomer.plan.customerDiscountValue);
                }
              }}
            >
              {customers.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Period start</span>
            <input className="input" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="label">Period end</span>
            <input className="input" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="label">Number of tiffin days</span>
            <input className="input" type="number" min="0" step="1" value={tiffinDays} onChange={(event) => setTiffinDays(Number(event.target.value))} />
          </label>
          <label className="grid gap-1">
            <span className="label">Rate per tiffin</span>
            <input className="input" type="number" min="0" value={dailyRate} onChange={(event) => setDailyRate(Number(event.target.value))} />
          </label>
          <label className="grid gap-1">
            <span className="label">Discount type</span>
            <select className="input" value={discountType} onChange={(event) => setDiscountType(event.target.value as DiscountType)}>
              <option value="none">None</option>
              <option value="fixed">Fixed</option>
              <option value="percent">Percent</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Discount value</span>
            <input className="input" type="number" min="0" value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} />
          </label>
          <label className="grid gap-1">
            <span className="label">Tax mode</span>
            <select className="input" value={taxMode} onChange={(event) => setTaxMode(event.target.value as TaxMode)}>
              <option value="no_tax">No tax</option>
              <option value="tax_exclusive">Tax exclusive</option>
              <option value="tax_inclusive">Tax inclusive</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Tax rate</span>
            <input className="input" type="number" min="0" step="0.01" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} />
          </label>
          <label className="grid gap-1">
            <span className="label">Payments received</span>
            <input className="input" type="number" min="0" value={paymentsReceived} onChange={(event) => setPaymentsReceived(Number(event.target.value))} />
          </label>
        </div>
      </section>

      <aside className="panel overflow-hidden">
        <div className="border-b border-black/10 bg-coconut px-4 py-3">
          <p className="label">Preview</p>
          <h2 className="font-black">{invoice.invoiceNumber}</h2>
          <p className="mt-1 text-sm text-ink/60">{customer.name}</p>
        </div>
        <div className="grid gap-3 p-4">
          <PreviewRow label="Tiffin days" value={invoice.deliveredDays} />
          <PreviewRow label="Rate per tiffin" value={formatMoney(invoice.dailyRate, settings.invoice.currency)} />
          <PreviewRow label="Subtotal" value={formatMoney(invoice.subtotalBeforeDiscount, settings.invoice.currency)} />
          <PreviewRow label="Discount" value={`-${formatMoney(invoice.discountAmount, settings.invoice.currency)}`} />
          <PreviewRow label={settings.tax.name} value={formatMoney(invoice.taxAmount, settings.invoice.currency)} />
          <PreviewRow label="Total due" value={formatMoney(invoice.totalDue, settings.invoice.currency)} strong />
          <PreviewRow label="Balance" value={formatMoney(invoice.balanceDue, settings.invoice.currency)} strong />
          <div className="mt-3 grid gap-2">
            <button className="primary-button" onClick={() => onSaveInvoice(invoice)}>
              <Save className="h-4 w-4" />
              Generate Invoice
            </button>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="secondary-button" onClick={() => void downloadInvoicePdf(invoice, customer, settings)}>
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button className="secondary-button" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PreviewRow({ label, value, strong = false }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-2 last:border-0">
      <span className="text-sm text-ink/62">{label}</span>
      <span className={strong ? "text-lg font-black" : "font-semibold"}>{value}</span>
    </div>
  );
}
