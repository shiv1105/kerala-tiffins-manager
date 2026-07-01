import type { Customer, DailyMenu, DeliveryRecord, FoodPreference } from "../types/domain";

export interface PackingConflict {
  customer: Customer;
  itemName: string;
  blockedTag: string;
  reason: string;
  severity: FoodPreference["severity"];
  type: FoodPreference["type"];
  substitute?: string;
}

const blockingPreferenceTypes = new Set(["dislike", "allergy", "dietary"]);

export function getPackingConflicts(customers: Customer[], deliveries: DeliveryRecord[], menu?: DailyMenu) {
  if (!menu) return [];

  const activeCustomerIds = new Set(
    deliveries
      .filter((record) => record.date === menu.date && ["scheduled", "delivered"].includes(record.status))
      .map((record) => record.customerId),
  );

  const menuTags = menu.items.flatMap((item) => item.tags.map((tag) => ({ tag, itemName: item.name })));

  return customers.flatMap((customer) => {
    if (!activeCustomerIds.has(customer.id)) return [];

    return customer.preferences.flatMap((preference) => {
      if (!blockingPreferenceTypes.has(preference.type)) return [];

      return menuTags
        .filter(({ tag }) => tag === preference.tag || (preference.tag === "vegetarian" && tag === "non_vegetarian"))
        .map(({ tag, itemName }) => ({
          customer,
          itemName,
          blockedTag: tag,
          reason: preference.notes ?? `${preference.type} restriction: ${preference.tag}`,
          severity: preference.severity,
          type: preference.type,
          substitute: preference.substituteTag,
        }));
    });
  });
}

export function isVegetarianCustomer(customer: Customer) {
  return customer.preferences.some((preference) => preference.tag === "vegetarian");
}
