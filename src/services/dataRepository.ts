import {
  auditLogs,
  customers,
  dailyMenus,
  deliveries,
  invoices,
  pauseRequests,
  settings,
  users,
} from "../data/sampleData";
import type {
  AppUser,
  AuditLogEntry,
  Customer,
  DailyMenu,
  DeliveryRecord,
  Invoice,
  PauseRequest,
  Settings,
} from "../types/domain";
import { type GitHubConfig, type GitHubFile, readJsonFile, saveWithConflictCheck } from "./githubClient";

export interface AppData {
  settings: Settings;
  users: AppUser[];
  customers: Customer[];
  dailyMenus: DailyMenu[];
  deliveries: DeliveryRecord[];
  pauseRequests: PauseRequest[];
  invoices: Invoice[];
  auditLogs: AuditLogEntry[];
}

export const demoData: AppData = {
  settings,
  users,
  customers,
  dailyMenus,
  deliveries,
  pauseRequests,
  invoices,
  auditLogs,
};

export interface LoadedRepositoryFile<T> extends GitHubFile<T> {
  loadedAt: string;
}

export interface LoadedRepositoryData {
  settingsFile: LoadedRepositoryFile<Settings>;
  usersFile: LoadedRepositoryFile<AppUser[]>;
  customersFile: LoadedRepositoryFile<Customer[]>;
  dailyMenusFile: LoadedRepositoryFile<DailyMenu[]>;
  deliveriesFile: LoadedRepositoryFile<DeliveryRecord[]>;
  pauseRequestsFile: LoadedRepositoryFile<PauseRequest[]>;
  invoicesFile: LoadedRepositoryFile<Invoice[]>;
  auditLogsFile: LoadedRepositoryFile<AuditLogEntry[]>;
}

export async function loadRepositoryData(config: GitHubConfig) {
  const month = new Date().toISOString().slice(0, 7);
  const [
    settingsFile,
    usersFile,
    customersFile,
    dailyMenusFile,
    deliveriesFile,
    pauseRequestsFile,
    invoicesFile,
    auditLogsFile,
  ] = await Promise.all([
    readJsonFile<Settings>(config, "data/settings.json"),
    readJsonFile<AppUser[]>(config, "data/users.json"),
    readJsonFile<Customer[]>(config, "data/customers.json"),
    readJsonFile<DailyMenu[]>(config, `data/daily_menus/${month}.json`),
    readJsonFile<DeliveryRecord[]>(config, `data/deliveries/${month}.json`),
    readJsonFile<PauseRequest[]>(config, `data/pause_requests/${month}.json`),
    readJsonFile<Invoice[]>(config, `data/invoices/${month}.json`),
    readJsonFile<AuditLogEntry[]>(config, `data/audit_logs/${month}.json`),
  ]);

  return {
    settingsFile: withLoadedAt(settingsFile),
    usersFile: withLoadedAt(usersFile),
    customersFile: withLoadedAt(customersFile),
    dailyMenusFile: withLoadedAt(dailyMenusFile),
    deliveriesFile: withLoadedAt(deliveriesFile),
    pauseRequestsFile: withLoadedAt(pauseRequestsFile),
    invoicesFile: withLoadedAt(invoicesFile),
    auditLogsFile: withLoadedAt(auditLogsFile),
  } satisfies LoadedRepositoryData;
}

export async function saveCustomers(
  config: GitHubConfig,
  file: LoadedRepositoryFile<Customer[]>,
  nextCustomers: Customer[],
) {
  return saveRepositoryFile(config, file, nextCustomers, "Update customer profiles");
}

export async function saveSettings(config: GitHubConfig, file: LoadedRepositoryFile<Settings>, nextSettings: Settings) {
  return saveRepositoryFile(config, file, nextSettings, "Update Kerala Tiffins settings");
}

export async function saveRepositoryFile<T>(
  config: GitHubConfig,
  file: LoadedRepositoryFile<T>,
  nextData: T,
  message: string,
) {
  return withLoadedAt(await saveWithConflictCheck(config, file, nextData, message));
}

function withLoadedAt<T>(file: GitHubFile<T>): LoadedRepositoryFile<T> {
  return {
    ...file,
    loadedAt: new Date().toISOString(),
  };
}
