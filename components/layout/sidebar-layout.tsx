"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
  className?: string;
}

export function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = "w-64",
  className,
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className={cn("flex min-h-screen bg-background", className)}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          tabIndex={-1}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarWidth,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar navigation"
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header with hamburger */}
        <div className="flex items-center gap-4 border-b px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <main className="flex-1 overflow-auto" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
