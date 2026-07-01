import { useMemo, useState } from "react";
import { AppShell, type NavItem } from "./components/AppShell";
import { SetupScreen, type SetupValues } from "./components/SetupScreen";
import { demoData, loadRepositoryData } from "./services/dataRepository";
import { loadLocalConfig, persistLocalConfig } from "./services/githubClient";
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

export default function App() {
  const storedConfig = loadLocalConfig();
  const [isReady, setIsReady] = useState(false);
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [syncStatus, setSyncStatus] = useState("Demo data");
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState<string | undefined>();
  const [setup, setSetup] = useState<SetupValues>({
    owner: storedConfig?.owner ?? "",
    repo: storedConfig?.repo ?? "kerala-tiffins-data",
    branch: storedConfig?.branch ?? "main",
    token: storedConfig?.rememberToken ? storedConfig.token ?? "" : "",
    rememberToken: storedConfig?.rememberToken ?? false,
  });

  const [settings, setSettings] = useState<Settings>(demoData.settings);
  const [customers, setCustomers] = useState<Customer[]>(demoData.customers);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(demoData.deliveries);
  const [pauseRequests, setPauseRequests] = useState<PauseRequest[]>(demoData.pauseRequests);
  const [invoices, setInvoices] = useState<Invoice[]>(demoData.invoices);
  const [auditLogs, setAuditLogs] = useState(demoData.auditLogs);
  const [users] = useState(demoData.users);
  const [dailyMenus] = useState(demoData.dailyMenus);

  const currentUser = users[0];
  const allowedNav = useMemo(
    () => navItems.filter((item) => currentUser.modules.includes(item.key)),
    [currentUser.modules],
  );

  const saveCustomer = (customer: Customer) => {
    setCustomers((current) => {
      const exists = current.some((item) => item.id === customer.id);
      return exists ? current.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...current];
    });
    addAudit("customer.updated", customer.id, `Saved profile for ${customer.name}.`);
  };

  const updateDelivery = (delivery: DeliveryRecord) => {
    setDeliveries((current) => current.map((item) => (item.id === delivery.id ? delivery : item)));
    addAudit("delivery.updated", delivery.customerId, `Marked ${delivery.date} as ${delivery.status}.`);
  };

  const createPause = (pause: PauseRequest) => {
    const pauseDates = getIsoDateRange(pause.startDate, pause.endDate);
    if (!pauseDates.length) {
      alert("Pause end date must be on or after the start date.");
      return;
    }

    setPauseRequests((current) => [pause, ...current]);
    setDeliveries((current) => {
      const customer = customers.find((item) => item.id === pause.customerId);
      const now = new Date().toISOString();
      const updatedDeliveries = current.map((delivery) =>
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

      return [...missingPauseDeliveries, ...updatedDeliveries];
    });
    addAudit("pause_request.applied", pause.customerId, `Applied pause from ${pause.startDate} to ${pause.endDate}.`);
  };

  const saveInvoice = (invoice: Invoice) => {
    setInvoices((current) => [invoice, ...current]);
    setSettings((current) => ({
      ...current,
      invoice: {
        ...current.invoice,
        nextNumber: current.invoice.nextNumber + 1,
      },
    }));
    addAudit("invoice.created", invoice.customerId, `Created ${invoice.invoiceNumber}.`);
  };

  const addAudit = (action: string, entity: string, summary: string) => {
    setAuditLogs((current) => [
      {
        id: `audit_${crypto.randomUUID()}`,
        actor: currentUser.name,
        action,
        entity,
        summary,
        timestamp: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const connectGitHub = async () => {
    try {
      setSyncStatus("Connecting to GitHub...");
      persistLocalConfig({
        owner: setup.owner,
        repo: setup.repo,
        branch: setup.branch,
        rememberToken: setup.rememberToken,
        token: setup.rememberToken ? setup.token : undefined,
      });
      const repoData = await loadRepositoryData({
        owner: setup.owner,
        repo: setup.repo,
        branch: setup.branch,
        token: setup.token,
      });
      setSettings(repoData.settingsFile.data);
      setCustomers(repoData.customersFile.data);
      setSyncStatus(`Synced ${new Date().toLocaleTimeString()}`);
      setIsReady(true);
    } catch (error) {
      setSyncStatus("Demo data");
      alert(error instanceof Error ? error.message : "GitHub connection failed.");
    }
  };

  if (!isReady) {
    return (
      <SetupScreen
        values={setup}
        onChange={setSetup}
        onConnect={connectGitHub}
        onContinueDemo={() => {
          setSyncStatus("Demo data");
          setIsReady(true);
        }}
      />
    );
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
          deliveries={deliveries}
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
          customers={customers}
          deliveries={deliveries}
          pauseRequests={pauseRequests}
          invoices={invoices}
          onChange={(nextSettings) => {
            setSettings(nextSettings);
            addAudit("settings.updated", "settings", "Updated business or system settings.");
          }}
        />
      ) : null}
    </AppShell>
  );
}
