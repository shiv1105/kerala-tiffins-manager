import { useMemo, useState } from "react";
import { AppShell, type NavItem } from "./components/AppShell";
import { SetupScreen } from "./components/SetupScreen";
import { demoData, type AppData } from "./services/dataRepository";
import type { Customer, DeliveryRecord, Invoice, ModuleKey, PauseRequest, Settings } from "./types/domain";
import { todayIso, tomorrowIso } from "./data/sampleData";
import { Dashboard } from "./routes/Dashboard";
import { Customers } from "./routes/Customers";
import { Scheduling } from "./routes/Scheduling";
import { PackingKitchen } from "./routes/PackingKitchen";
import { InvoiceGenerator } from "./routes/InvoiceGenerator";
import { Reports } from "./routes/Reports";
import { Settings as SettingsRoute } from "./routes/Settings";
import { getIsoDateRange } from "./utils/dates";

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "customers", label: "Customers" },
  { key: "scheduling", label: "Scheduling" },
  { key: "packing", label: "Packing / Kitchen" },
  { key: "invoices", label: "Invoice Generator" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
];

const workspaceStorageKey = "kt_local_workspace";

export default function App() {
  const localWorkspace = loadLocalWorkspace();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [syncStatus, setSyncStatus] = useState("Local workspace");
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState<string | undefined>();

  const [settings, setSettings] = useState<Settings>(localWorkspace.settings);
  const [customers, setCustomers] = useState<Customer[]>(localWorkspace.customers);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(localWorkspace.deliveries);
  const [pauseRequests, setPauseRequests] = useState<PauseRequest[]>(localWorkspace.pauseRequests);
  const [invoices, setInvoices] = useState<Invoice[]>(localWorkspace.invoices);
  const [auditLogs, setAuditLogs] = useState(localWorkspace.auditLogs);
  const [users] = useState(localWorkspace.users);
  const [dailyMenus] = useState(localWorkspace.dailyMenus);

  const currentUser = users[0];
  const allowedNav = useMemo(
    () => navItems.filter((item) => currentUser.modules.includes(item.key)),
    [currentUser.modules],
  );

  const saveWorkspace = (nextData: Partial<AppData>) => {
    const storedWorkspace = readStoredWorkspace();
    const merged = {
      settings,
      users,
      customers,
      dailyMenus,
      deliveries,
      pauseRequests,
      invoices,
      auditLogs,
      ...(storedWorkspace ?? {}),
      ...nextData,
    };
    localStorage.setItem(workspaceStorageKey, JSON.stringify(merged));
    setSyncStatus(`Saved locally ${new Date().toLocaleTimeString()}`);
    return true;
  };

  const saveCustomer = async (customer: Customer) => {
    const exists = customers.some((item) => item.id === customer.id);
    const nextCustomers = exists ? customers.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...customers];
    setCustomers(nextCustomers);
    saveWorkspace({ customers: nextCustomers });
    void addAudit("customer.updated", customer.id, `Saved profile for ${customer.name}.`);
    return true;
  };

  const updateDelivery = async (delivery: DeliveryRecord) => {
    const nextDeliveries = deliveries.map((item) => (item.id === delivery.id ? delivery : item));
    setDeliveries(nextDeliveries);
    saveWorkspace({ deliveries: nextDeliveries });
    void addAudit("delivery.updated", delivery.customerId, `Marked ${delivery.date} as ${delivery.status}.`);
  };

  const createPause = (pause: PauseRequest) => {
    const pauseDates = getIsoDateRange(pause.startDate, pause.endDate);
    if (!pauseDates.length) {
      alert("Pause end date must be on or after the start date.");
      return;
    }

    const nextPauseRequests = [pause, ...pauseRequests];
    const customer = customers.find((item) => item.id === pause.customerId);
    const now = new Date().toISOString();
    const updatedDeliveries = deliveries.map((delivery) =>
        delivery.customerId === pause.customerId && pauseDates.includes(delivery.date)
          ? { ...delivery, status: "customer_pause" as const, reason: pause.reason, markedAt: now, markedBy: pause.createdBy }
          : delivery,
    );
    const existingKeys = new Set(updatedDeliveries.map((delivery) => `${delivery.customerId}:${delivery.date}`));
    const missingPauseDeliveries = pauseDates
      .filter((date) => !existingKeys.has(`${pause.customerId}:${date}`))
      .map((date) => ({
        id: `del_${crypto.randomUUID()}`,
        customerId: pause.customerId,
        date,
        mealType: customer?.plan.mealType ?? "lunch",
        status: "customer_pause" as const,
        reason: pause.reason,
        markedAt: now,
        markedBy: pause.createdBy,
      }));
    const nextDeliveries = [...missingPauseDeliveries, ...updatedDeliveries];

    setPauseRequests(nextPauseRequests);
    setDeliveries(nextDeliveries);
    saveWorkspace({ pauseRequests: nextPauseRequests, deliveries: nextDeliveries });
    void addAudit("pause_request.applied", pause.customerId, `Applied pause from ${pause.startDate} to ${pause.endDate}.`);
  };

  const saveInvoice = (invoice: Invoice) => {
    const nextInvoices = [invoice, ...invoices];
    const nextSettings = {
      ...settings,
      invoice: {
        ...settings.invoice,
        nextNumber: settings.invoice.nextNumber + 1,
      },
    };
    setInvoices(nextInvoices);
    setSettings(nextSettings);
    saveWorkspace({ invoices: nextInvoices, settings: nextSettings });
    void addAudit("invoice.created", invoice.customerId, `Created ${invoice.invoiceNumber}.`);
  };

  const addAudit = async (action: string, entity: string, summary: string) => {
    const nextAuditLogs = [
      {
        id: `audit_${crypto.randomUUID()}`,
        actor: currentUser.name,
        action,
        entity,
        summary,
        timestamp: new Date().toISOString(),
      },
      ...auditLogs,
    ];
    setAuditLogs(nextAuditLogs);
    saveWorkspace({ auditLogs: nextAuditLogs });
  };

  const enterWorkspace = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <SetupScreen onContinueDemo={enterWorkspace} />;
  }

  return (
    <AppShell active={active} onNavigate={setActive} navItems={allowedNav} user={currentUser} syncStatus={syncStatus}>
      {active === "dashboard" ? (
        <Dashboard
          customers={customers}
          deliveries={deliveries}
          pauseRequests={pauseRequests}
          invoices={invoices}
          dailyMenus={dailyMenus}
          auditLogs={auditLogs}
          today={todayIso}
          tomorrow={tomorrowIso}
        />
      ) : null}
      {active === "customers" ? (
        <Customers
          customers={customers}
          onSave={saveCustomer}
          onCreatePause={createPause}
          onGenerateInvoice={(customerId) => {
            setSelectedInvoiceCustomer(customerId);
            setActive("invoices");
          }}
        />
      ) : null}
      {active === "scheduling" ? (
        <Scheduling
          customers={customers}
          deliveries={deliveries}
          pauseRequests={pauseRequests}
          today={todayIso}
          tomorrow={tomorrowIso}
          onUpdateDelivery={updateDelivery}
          onCreatePause={createPause}
        />
      ) : null}
      {active === "packing" ? <PackingKitchen customers={customers} deliveries={deliveries} dailyMenus={dailyMenus} today={todayIso} /> : null}
      {active === "invoices" ? (
        <InvoiceGenerator
          customers={customers}
          settings={settings}
          selectedCustomerId={selectedInvoiceCustomer}
          onSaveInvoice={saveInvoice}
        />
      ) : null}
      {active === "reports" ? <Reports customers={customers} deliveries={deliveries} invoices={invoices} /> : null}
      {active === "settings" ? (
        <SettingsRoute
          settings={settings}
          users={users}
          onChange={(nextSettings) => {
            setSettings(nextSettings);
            saveWorkspace({ settings: nextSettings });
            addAudit("settings.updated", "settings", "Updated business or system settings.");
          }}
        />
      ) : null}
    </AppShell>
  );
}

function loadLocalWorkspace(): AppData {
  const storedWorkspace = readStoredWorkspace();
  if (!storedWorkspace) return demoData;

  return { ...demoData, ...storedWorkspace };
}

function readStoredWorkspace(): Partial<AppData> | null {
  const stored = localStorage.getItem(workspaceStorageKey);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Partial<AppData>;
  } catch {
    localStorage.removeItem(workspaceStorageKey);
    return null;
  }
}
