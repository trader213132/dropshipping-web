"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Palette,
  Store,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function navItems(slug: string): NavItem[] {
  return [
    { label: "Dashboard",        href: `/app/${slug}/dashboard`,     icon: LayoutDashboard },
    { label: "Product Research", href: `/app/${slug}/research`,      icon: TrendingUp },
    { label: "Inventory",        href: `/app/${slug}/inventory`,     icon: Package },
    { label: "Brand Studio",     href: `/app/${slug}/brand`,         icon: Palette },
    { label: "Store Builder",    href: `/app/${slug}/store`,         icon: Store },
    { label: "Automation",       href: `/app/${slug}/automation`,    icon: Zap },
    { label: "Analytics",        href: `/app/${slug}/analytics`,     icon: BarChart3 },
    { label: "Integrations",     href: `/app/${slug}/integrations`,  icon: Plug },
  ];
}

interface AppSidebarProps {
  workspaceName: string;
  workspaceSlug: string;
  userName: string | null;
  userEmail: string;
  userImage: string | null;
}

export function AppSidebar({
  workspaceName,
  workspaceSlug,
  userName,
  userEmail,
  userImage,
}: AppSidebarProps) {
  const pathname = usePathname();
  const items = navItems(workspaceSlug);

  const initials = (userName ?? userEmail)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Workspace header — gradient brand mark */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 px-3 py-2.5 shadow-sm shadow-violet-900/20">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="truncate text-sm font-semibold text-white">{workspaceName}</span>
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-white/60" />
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="App navigation">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href as Route}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive
                      ? "bg-violet-50 font-medium text-violet-700 before:absolute before:left-0 before:top-1.5 before:h-[calc(100%-12px)] before:w-0.5 before:rounded-r-full before:bg-violet-600 dark:bg-violet-900/20 dark:text-violet-300 dark:before:bg-violet-400"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* Bottom section */}
      <div className="space-y-0.5 p-2">
        <Link
          href={`/app/${workspaceSlug}/settings` as Route}
          className={cn(
            "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
            pathname.startsWith(`/app/${workspaceSlug}/settings`)
              ? "bg-violet-50 font-medium text-violet-700 before:absolute before:left-0 before:top-1.5 before:h-[calc(100%-12px)] before:w-0.5 before:rounded-r-full before:bg-violet-600 dark:bg-violet-900/20 dark:text-violet-300 dark:before:bg-violet-400"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>

      <Separator />

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Avatar className="h-7 w-7 shrink-0">
          {userImage && <AvatarImage src={userImage} alt={userName ?? userEmail} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-900 dark:text-white">
            {userName ?? userEmail}
          </p>
          {userName && (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
