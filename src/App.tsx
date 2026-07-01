import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell, type NavItem } from "./components/AppShell";
import { LiveDataSetup } from "./components/LiveDataSetup";
import { SetupScreen, type SetupValues } from "./components/SetupScreen";
import {
  demoData,
  type LoadedRepositoryData,
  type LoadedRepositoryFile,
  loadRepositoryData,
  saveRepositoryFile,
} from "./services/dataRepository";
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
  const attemptedAutoConnect = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("kt_admin_session") === "true");
  const [isReady, setIsReady] = useState(false);
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [syncStatus, setSyncStatus] = useState("Live workspace");
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState<string | undefined>();
  const [setup, setSetup] = useState<SetupValues>({
    owner: storedConfig?.owner ?? "shiv1105",
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
  const [users, setUsers] = useState(demoData.users);
  const [dailyMenus, setDailyMenus] = useState(demoData.dailyMenus);
  const [repoFiles, setRepoFiles] = useState<LoadedRepositoryData | null>(null);

  const currentUser = users[0];
  const allowedNav = useMemo(
    () => navItems.filter((item) => currentUser.modules.includes(item.key)),
    [currentUser.modules],
  );

  const persistRepositoryFile = async <T,>(fileKey: keyof LoadedRepositoryData, nextData: T, message: string) => {
    if (!repoFiles) return;

    try {
      setSyncStatus("Saving to GitHub...");
      const nextFile = await saveRepositoryFile(
        {
          owner: setup.owner,
          repo: setup.repo,
          branch: setup.branch,
          token: setup.token,
        },
        repoFiles[fileKey] as LoadedRepositoryFile<T>,
        nextData,
        message,
      );
      setRepoFiles((current) => (current ? { ...current, [fileKey]: nextFile } : current));
      setSyncStatus(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setSyncStatus("Save failed");
      alert(error instanceof Error ? error.message : "GitHub save failed.");
    }
  };

  const saveCustomer = (customer: Customer) => {
    const exists = customers.some((item) => item.id === customer.id);
    const nextCustomers = exists ? customers.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...customers];
    setCustomers(nextCustomers);
    void persistRepositoryFile("customersFile", nextCustomers, "Update customer profiles");
    addAudit("customer.updated", customer.id, `Saved profile for ${customer.name}.`);
  };

  const updateDelivery = (delivery: DeliveryRecord) => {
    const nextDeliveries = deliveries.map((item) => (item.id === delivery.id ? delivery : item));
    setDeliveries(nextDeliveries);
    void persistRepositoryFile("deliveriesFile", nextDeliveries, "Update delivery records");
    addAudit("delivery.updated", delivery.customerId, `Marked ${delivery.date} as ${delivery.status}.`);
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
    void persistRepositoryFile("pauseRequestsFile", nextPauseRequests, "Update pause requests");
    void persistRepositoryFile("deliveriesFile", nextDeliveries, "Apply pause to delivery records");
    addAudit("pause_request.applied", pause.customerId, `Applied pause from ${pause.startDate} to ${pause.endDate}.`);
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
    void persistRepositoryFile("invoicesFile", nextInvoices, "Create invoice");
    void persistRepositoryFile("settingsFile", nextSettings, "Advance invoice number");
    addAudit("invoice.created", invoice.customerId, `Created ${invoice.invoiceNumber}.`);
  };

  const addAudit = (action: string, entity: string, summary: string) => {
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
    void persistRepositoryFile("auditLogsFile", nextAuditLogs, "Append audit log");
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
      setUsers(repoData.usersFile.data);
      setCustomers(repoData.customersFile.data);
      setDailyMenus(repoData.dailyMenusFile.data);
      setDeliveries(repoData.deliveriesFile.data);
      setPauseRequests(repoData.pauseRequestsFile.data);
      setInvoices(repoData.invoicesFile.data);
      setAuditLogs(repoData.auditLogsFile.data);
      setRepoFiles(repoData);
      setSyncStatus(`Synced ${new Date().toLocaleTimeString()}`);
      setIsReady(true);
    } catch (error) {
      setSyncStatus("Live workspace");
      alert(error instanceof Error ? error.message : "GitHub connection failed.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isReady || attemptedAutoConnect.current || !setup.token) return;
    attemptedAutoConnect.current = true;
    void connectGitHub();
  }, [isAuthenticated, isReady, setup.token]);

  const enterWorkspace = () => {
    localStorage.setItem("kt_admin_session", "true");
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <SetupScreen
        onContinueDemo={enterWorkspace}
      />
    );
  }

  if (!isReady) {
    return <LiveDataSetup values={setup} status={syncStatus} onChange={setSetup} onConnect={connectGitHub} />;
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
            void persistRepositoryFile("settingsFile", nextSettings, "Update Kerala Tiffins settings");
            addAudit("settings.updated", "settings", "Updated business or system settings.");
          }}
        />
      ) : null}
    </AppShell>
  );
}
