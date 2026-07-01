import { describe, expect, it } from "vitest";
import type { DeliveryRecord } from "../types/domain";
import { calculateInvoice } from "./billing";

const records: DeliveryRecord[] = Array.from({ length: 20 }, (_, index) => ({
  id: `delivery_${index}`,
  customerId: "cust_1",
  date: `2026-06-${String(index + 1).padStart(2, "0")}`,
  mealType: "lunch",
  status: "delivered",
}));

describe("calculateInvoice", () => {
  it("calculates no skipped days with tax off", () => {
    const result = calculateInvoice(records, {
      customerId: "cust_1",
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      dailyRate: 12,
      discountType: "none",
      discountValue: 0,
      taxMode: "no_tax",
      taxRate: 0,
    });

    expect(result.deliveredDays).toBe(20);
    expect(result.subtotalBeforeDiscount).toBe(240);
    expect(result.totalDue).toBe(240);
  });

  it("excludes customer pause days", () => {
    const result = calculateInvoice(
      [...records.slice(0, 19), { id: "pause", customerId: "cust_1", date: "2026-06-20", mealType: "lunch", status: "customer_pause" }],
      {
        customerId: "cust_1",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        dailyRate: 12,
        discountType: "none",
        discountValue: 0,
        taxMode: "no_tax",
        taxRate: 0,
      },
    );

    expect(result.deliveredDays).toBe(19);
    expect(result.skippedDays).toBe(1);
    expect(result.totalDue).toBe(228);
  });

  it("applies fixed and percent discounts", () => {
    expect(
      calculateInvoice(records.slice(0, 19), {
        customerId: "cust_1",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        dailyRate: 12,
        discountType: "fixed",
        discountValue: 10,
        taxMode: "no_tax",
        taxRate: 0,
      }).totalDue,
    ).toBe(218);

    expect(
      calculateInvoice(records, {
        customerId: "cust_1",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        dailyRate: 12,
        discountType: "percent",
        discountValue: 10,
        taxMode: "no_tax",
        taxRate: 0,
      }).totalDue,
    ).toBe(216);
  });

  it("handles exclusive and inclusive tax", () => {
    expect(
      calculateInvoice(records, {
        customerId: "cust_1",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        dailyRate: 12,
        discountType: "none",
        discountValue: 0,
        taxMode: "tax_exclusive",
        taxRate: 0.13,
      }).totalDue,
    ).toBe(271.2);

    const inclusive = calculateInvoice(records, {
      customerId: "cust_1",
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      dailyRate: 12,
      discountType: "none",
      discountValue: 0,
      taxMode: "tax_inclusive",
      taxRate: 0.13,
    });

    expect(inclusive.totalDue).toBe(240);
    expect(inclusive.taxAmount).toBe(27.61);
  });
});
