import type { Customer, Settings } from "../types/domain";

export function validateCustomer(customer: Customer) {
  const errors: string[] = [];
  if (!customer.name.trim()) errors.push("Customer name is required.");
  if (!customer.phone.trim()) errors.push("Phone number is required.");
  if (!customer.address.street.trim()) errors.push("Street address is required.");
  if (!customer.plan.deliveryDays.length) errors.push("At least one delivery day is required.");
  if (customer.plan.defaultRate < 0) errors.push("Default rate cannot be negative.");
  return errors;
}

export function validateSettings(settings: Settings) {
  const errors: string[] = [];
  if (!settings.business.name.trim()) errors.push("Business name is required.");
  if (settings.pricing.defaultPricePerTiffin < 0) errors.push("Default tiffin price cannot be negative.");
  if (settings.tax.rate < 0) errors.push("Tax rate cannot be negative.");
  if (settings.invoice.nextNumber < 1) errors.push("Next invoice number must be at least 1.");
  return errors;
}
