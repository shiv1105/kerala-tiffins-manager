import type { Customer, Invoice, Settings } from "../types/domain";
import { formatMoney } from "./billing";

export async function downloadInvoicePdf(invoice: Invoice, customer: Customer, settings: Settings) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 18;
  const right = 190;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(settings.business.name, margin, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(settings.business.address, margin, 30);
  doc.text(`${settings.business.phone}  |  ${settings.business.email}`, margin, 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Invoice", right, 22, { align: "right" });
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, right, 30, { align: "right" });

  doc.setDrawColor(15, 107, 79);
  doc.setLineWidth(0.8);
  doc.line(margin, 44, right, 44);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To", margin, 56);
  doc.setFont("helvetica", "normal");
  doc.text(customer.name, margin, 64);
  doc.text(customer.phone, margin, 70);
  doc.text(`${customer.address.street}${customer.address.unit ? `, ${customer.address.unit}` : ""}`, margin, 76);
  doc.text(`${customer.address.city}, ${customer.address.postalCode}`, margin, 82);

  doc.setFont("helvetica", "bold");
  doc.text("Billing Period", 120, 56);
  doc.setFont("helvetica", "normal");
  doc.text(`${invoice.periodStart} to ${invoice.periodEnd}`, 120, 64);
  doc.text(`Due in ${settings.invoice.dueDays} days`, 120, 70);

  const rows = [
    ["Tiffin days", String(invoice.deliveredDays)],
    ["Rate per tiffin", formatMoney(invoice.dailyRate, settings.invoice.currency)],
    ["Subtotal", formatMoney(invoice.subtotalBeforeDiscount, settings.invoice.currency)],
    ["Discount", `-${formatMoney(invoice.discountAmount, settings.invoice.currency)}`],
    [`Tax (${settings.tax.name})`, formatMoney(invoice.taxAmount, settings.invoice.currency)],
    ["Payments/Credits", `-${formatMoney(invoice.paymentsReceived + invoice.credits, settings.invoice.currency)}`],
    ["Balance Due", formatMoney(invoice.balanceDue, settings.invoice.currency)],
  ];

  let y = 104;
  doc.setFillColor(247, 245, 239);
  doc.rect(margin, 92, right - margin, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 2, 99);
  doc.text("Amount", right - 2, 99, { align: "right" });

  rows.forEach(([label, value], index) => {
    doc.setFont("helvetica", index === rows.length - 1 ? "bold" : "normal");
    doc.text(label, margin + 2, y);
    doc.text(value, right - 2, y, { align: "right" });
    y += 10;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(settings.invoice.notes, margin, 176, { maxWidth: 172 });
  doc.text(settings.business.invoiceFooterNote, margin, 190);
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
