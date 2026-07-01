import type { DeliveryRecord, DiscountType, Invoice, TaxMode } from "../types/domain";
import { isDateInRange } from "./dates";

export interface InvoiceCalculationInput {
  customerId: string;
  periodStart: string;
  periodEnd: string;
  dailyRate: number;
  discountType: DiscountType;
  discountValue: number;
  taxMode: TaxMode;
  taxRate: number;
  paymentsReceived?: number;
  credits?: number;
  failedDeliveryBillable?: boolean;
}

export interface ManualInvoiceCalculationInput {
  tiffinDays: number;
  dailyRate: number;
  discountType: DiscountType;
  discountValue: number;
  taxMode: TaxMode;
  taxRate: number;
  paymentsReceived?: number;
  credits?: number;
}

export interface InvoiceCalculationResult
  extends Pick<
    Invoice,
    | "deliveredDays"
    | "skippedDays"
    | "subtotalBeforeDiscount"
    | "discountAmount"
    | "subtotalAfterDiscount"
    | "taxAmount"
    | "totalDue"
    | "paymentsReceived"
    | "credits"
    | "balanceDue"
  > {}

export function calculateInvoice(
  deliveries: DeliveryRecord[],
  input: InvoiceCalculationInput,
): InvoiceCalculationResult {
  const matching = deliveries.filter(
    (record) => record.customerId === input.customerId && isDateInRange(record.date, input.periodStart, input.periodEnd),
  );

  const deliveredDays = matching.filter((record) => {
    if (record.status === "delivered") return true;
    if (record.status === "failed") return record.billable ?? input.failedDeliveryBillable ?? false;
    return false;
  }).length;

  const skippedDays = matching.filter((record) =>
    ["skipped", "customer_pause", "cancelled_before_prep"].includes(record.status),
  ).length;

  const subtotalBeforeDiscount = roundMoney(deliveredDays * input.dailyRate);
  const discountAmount = getDiscountAmount(subtotalBeforeDiscount, input.discountType, input.discountValue);
  const subtotalAfterDiscount = roundMoney(Math.max(0, subtotalBeforeDiscount - discountAmount));
  const taxAmount = getTaxAmount(subtotalAfterDiscount, input.taxMode, input.taxRate);
  const totalDue =
    input.taxMode === "tax_exclusive" ? roundMoney(subtotalAfterDiscount + taxAmount) : subtotalAfterDiscount;
  const paymentsReceived = input.paymentsReceived ?? 0;
  const credits = input.credits ?? 0;
  const balanceDue = roundMoney(totalDue - paymentsReceived - credits);

  return {
    deliveredDays,
    skippedDays,
    subtotalBeforeDiscount,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    totalDue,
    paymentsReceived,
    credits,
    balanceDue,
  };
}

export function calculateManualInvoice(input: ManualInvoiceCalculationInput): InvoiceCalculationResult {
  const deliveredDays = Math.max(0, Math.floor(input.tiffinDays));
  const skippedDays = 0;
  const subtotalBeforeDiscount = roundMoney(deliveredDays * input.dailyRate);
  const discountAmount = getDiscountAmount(subtotalBeforeDiscount, input.discountType, input.discountValue);
  const subtotalAfterDiscount = roundMoney(Math.max(0, subtotalBeforeDiscount - discountAmount));
  const taxAmount = getTaxAmount(subtotalAfterDiscount, input.taxMode, input.taxRate);
  const totalDue =
    input.taxMode === "tax_exclusive" ? roundMoney(subtotalAfterDiscount + taxAmount) : subtotalAfterDiscount;
  const paymentsReceived = input.paymentsReceived ?? 0;
  const credits = input.credits ?? 0;
  const balanceDue = roundMoney(totalDue - paymentsReceived - credits);

  return {
    deliveredDays,
    skippedDays,
    subtotalBeforeDiscount,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    totalDue,
    paymentsReceived,
    credits,
    balanceDue,
  };
}

export function getDiscountAmount(baseAmount: number, type: DiscountType, value: number) {
  if (type === "fixed") return roundMoney(Math.min(value, baseAmount));
  if (type === "percent") return roundMoney(baseAmount * (value / 100));
  return 0;
}

export function getTaxAmount(subtotalAfterDiscount: number, mode: TaxMode, rate: number) {
  if (mode === "tax_exclusive") return roundMoney(subtotalAfterDiscount * rate);
  if (mode === "tax_inclusive") return roundMoney(subtotalAfterDiscount - subtotalAfterDiscount / (1 + rate));
  return 0;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value);
}
