import {
  BarChart3,
  CalendarDays,
  ChefHat,
  FileText,
  Home,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AppUser, ModuleKey } from "../types/domain";

export interface NavItem {
  key: ModuleKey;
  label: string;
}

const icons = {
  dashboard: Home,
  customers: Users,
  scheduling: CalendarDays,
  packing: ChefHat,
  invoices: ReceiptText,
  reports: BarChart3,
  settings: Settings,
} satisfies Record<ModuleKey, typeof Home>;

export function AppShell({
  active,
  onNavigate,
  navItems,
  user,
  syncStatus,
  onLogout,
  children,
}: {
  active: ModuleKey;
  onNavigate: (key: ModuleKey) => void;
  navItems: NavItem[];
  user: AppUser;
  syncStatus: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = useMemo(() => navItems.find((item) => item.key === active)?.label ?? "Dashboard", [active, navItems]);

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = icons[item.key];
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${
              selected ? "bg-leaf text-white" : "text-ink/75 hover:bg-leaf/8 hover:text-ink"
            }`}
            onClick={() => {
              onNavigate(item.key);
              setMobileOpen(false);
            }}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-coconut text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-black/10 bg-white px-4 py-5 lg:block">
        <Brand />
        <div className="mt-8">{nav}</div>
        <SidebarFooter user={user} syncStatus={syncStatus} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-ink/35 lg:hidden">
          <div className="h-full w-[min(22rem,86vw)] bg-white px-4 py-5 shadow-soft">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">{nav}</div>
            <SidebarFooter user={user} syncStatus={syncStatus} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-coconut/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button className="icon-button lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="label">Kerala Tiffins Manager</p>
                <h1 className="truncate text-xl font-bold text-ink">{activeLabel}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-ink/70 sm:flex">
                <FileText className="h-4 w-4 text-leaf" />
                <span className="truncate">{syncStatus}</span>
              </div>
              <button className="secondary-button h-9" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-leaf text-sm font-black text-white">KT</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-ink">Kerala Tiffins</p>
        <p className="truncate text-xs text-ink/55">Internal operations</p>
      </div>
    </div>
  );
}

function SidebarFooter({ user, syncStatus }: { user: AppUser; syncStatus: string }) {
  return (
    <div className="absolute bottom-5 left-4 right-4 space-y-3">
      <div className="rounded-md border border-black/10 bg-coconut p-3">
        <p className="text-sm font-bold text-ink">{user.name}</p>
        <p className="text-xs capitalize text-ink/60">{user.role}</p>
      </div>
      <p className="text-xs text-ink/50">{syncStatus}</p>
    </div>
  );
}
