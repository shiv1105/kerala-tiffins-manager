export type Role = "owner" | "manager" | "kitchen" | "packing" | "delivery" | "billing";

export type ModuleKey =
  | "dashboard"
  | "customers"
  | "scheduling"
  | "packing"
  | "invoices"
  | "reports"
  | "settings";

export type CustomerStatus = "active" | "paused" | "cancelled" | "archived";
export type MealType = "lunch" | "dinner" | "both";
export type DeliveryStatus =
  | "scheduled"
  | "delivered"
  | "skipped"
  | "customer_pause"
  | "failed"
  | "cancelled_before_prep";

export type PreferenceType =
  | "like"
  | "dislike"
  | "allergy"
  | "dietary"
  | "spice_level"
  | "substitution";

export type TaxMode = "no_tax" | "tax_exclusive" | "tax_inclusive";
export type DiscountType = "none" | "fixed" | "percent";

export interface Address {
  street: string;
  unit?: string;
  city: string;
  postalCode: string;
  zone: string;
  landmark?: string;
  routeOrder?: number;
  deliveryInstructions?: string;
}

export interface FoodPreference {
  id: string;
  type: PreferenceType;
  tag: string;
  severity: "low" | "medium" | "high" | "critical";
  substituteTag?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  code: string;
  status: CustomerStatus;
  name: string;
  preferredName?: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  whatsapp?: string;
  preferredContact: "phone" | "whatsapp" | "email";
  address: Address;
  plan: {
    type: "weekly" | "monthly" | "custom";
    mealType: MealType;
    startDate: string;
    endDate?: string;
    deliveryDays: string[];
    defaultRate: number;
    billingCycle: "weekly" | "monthly" | "custom";
    customerDiscountType: DiscountType;
    customerDiscountValue: number;
  };
  preferences: FoodPreference[];
  notes: {
    kitchen?: string;
    packing?: string;
    delivery?: string;
    admin?: string;
  };
  outstandingBalance: number;
  paymentMethodNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMenu {
  date: string;
  mealType: MealType;
  items: Array<{
    id: string;
    name: string;
    tags: string[];
  }>;
  notes?: string;
}

export interface DeliveryRecord {
  id: string;
  customerId: string;
  date: string;
  mealType: MealType;
  status: DeliveryStatus;
  reason?: string;
  markedBy?: string;
  markedAt?: string;
  billable?: boolean;
}

export interface PauseRequest {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  reason: string;
  source: "phone" | "whatsapp" | "text" | "email" | "in_person";
  status: "requested" | "applied" | "rejected" | "expired";
  createdBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  periodStart: string;
  periodEnd: string;
  deliveredDays: number;
  skippedDays: number;
  dailyRate: number;
  discountType: DiscountType;
  discountValue: number;
  discountReason?: string;
  taxMode: TaxMode;
  taxRate: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  totalDue: number;
  paymentsReceived: number;
  credits: number;
  balanceDue: number;
  status: "draft" | "sent" | "paid" | "void";
  createdAt: string;
}

export interface Settings {
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxRegistrationNumber?: string;
    invoiceFooterNote: string;
  };
  pricing: {
    defaultPricePerTiffin: number;
    weeklyPlan: number;
    monthlyPlan: number;
    lunchRate: number;
    dinnerRate: number;
    deliveryFee: number;
  };
  tax: {
    mode: TaxMode;
    name: string;
    rate: number;
    registrationNumber?: string;
    applyAfterDiscount: boolean;
  };
  discounts: {
    enabled: boolean;
    maxPercent: number;
    requireReason: boolean;
  };
  invoice: {
    prefix: string;
    nextNumber: number;
    dueDays: number;
    currency: "CAD" | "USD";
    notes: string;
  };
  scheduling: {
    defaultDeliveryDays: string[];
    pauseCutoffTime: string;
    failedDeliveryBillable: boolean;
  };
  github: {
    owner: string;
    repo: string;
    branch: string;
    dataMode: "json" | "excel";
    lockTimeoutMinutes: number;
  };
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  modules: ModuleKey[];
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  summary: string;
  timestamp: string;
}

export interface DashboardMetrics {
  activeToday: number;
  pausedTomorrow: number;
  restrictionAlerts: number;
  invoicesDue: number;
  vegetarianCount: number;
  nonVegetarianCount: number;
  allergyWarnings: number;
}
