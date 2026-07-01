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

export async function loadRepositoryData(config: GitHubConfig) {
  const [settingsFile, usersFile, customersFile] = await Promise.all([
    readJsonFile<Settings>(config, "data/settings.json"),
    readJsonFile<AppUser[]>(config, "data/users.json"),
    readJsonFile<Customer[]>(config, "data/customers.json"),
  ]);

  return {
    settingsFile: withLoadedAt(settingsFile),
    usersFile: withLoadedAt(usersFile),
    customersFile: withLoadedAt(customersFile),
  };
}

export async function saveCustomers(
  config: GitHubConfig,
  file: LoadedRepositoryFile<Customer[]>,
  nextCustomers: Customer[],
) {
  return saveWithConflictCheck(config, file, nextCustomers, "Update customer profiles");
}

export async function saveSettings(config: GitHubConfig, file: LoadedRepositoryFile<Settings>, nextSettings: Settings) {
  return saveWithConflictCheck(config, file, nextSettings, "Update Kerala Tiffins settings");
}

function withLoadedAt<T>(file: GitHubFile<T>): LoadedRepositoryFile<T> {
  return {
    ...file,
    loadedAt: new Date().toISOString(),
  };
}
