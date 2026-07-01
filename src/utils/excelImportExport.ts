import type { Customer, DeliveryRecord, Invoice, PauseRequest, Settings } from "../types/domain";

export interface BackupWorkbookData {
  settings: Settings;
  customers: Customer[];
  deliveries: DeliveryRecord[];
  pauseRequests: PauseRequest[];
  invoices: Invoice[];
}

export async function buildExcelBackup(data: BackupWorkbookData) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(flattenCustomers(data.customers)), "Customers");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.deliveries), "Deliveries");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.pauseRequests), "Pause Requests");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.invoices), "Invoices");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([data.settings.business]), "Business Settings");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export async function downloadExcelBackup(data: BackupWorkbookData) {
  const buffer = await buildExcelBackup(data);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kerala_tiffins_backup_${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

function flattenCustomers(customers: Customer[]) {
  return customers.map((customer) => ({
    id: customer.id,
    code: customer.code,
    status: customer.status,
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    address: `${customer.address.street}${customer.address.unit ? `, ${customer.address.unit}` : ""}`,
    city: customer.address.city,
    postalCode: customer.address.postalCode,
    zone: customer.address.zone,
    planType: customer.plan.type,
    mealType: customer.plan.mealType,
    deliveryDays: customer.plan.deliveryDays.join(", "),
    defaultRate: customer.plan.defaultRate,
    restrictions: customer.preferences
      .map((preference) => `${preference.type}:${preference.tag}${preference.substituteTag ? ` -> ${preference.substituteTag}` : ""}`)
      .join("; "),
    outstandingBalance: customer.outstandingBalance,
  }));
}
