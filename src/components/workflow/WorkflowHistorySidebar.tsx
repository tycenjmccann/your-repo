"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "workflow-sidebar-collapsed";

export function WorkflowHistorySidebar() {
  // Lazy state initializer reads localStorage without triggering an extra render.
  // This avoids the react-hooks/set-state-in-effect lint error and
  // eliminates the hydration flash where the sidebar briefly shows
  // expanded before collapsing.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <aside
      role="complementary"
      aria-label="Workflow history"
      className={`relative flex flex-col h-full border-r border-zinc-800 bg-zinc-900 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-12" : "w-[280px]"
      }`}
    >
      <button
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls="history-panel"
        aria-label="Toggle workflow history sidebar"
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-sky-400 hover:border-sky-500/50 transition-colors cursor-pointer shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      <div
        id="history-panel"
        className={`flex-1 overflow-hidden transition-opacity duration-200 ${
          collapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        {!collapsed && (
          <div className="p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Workflow History
            </h2>
            <nav aria-label="Previous workflow runs" className="mt-4">
              <ul role="list" className="space-y-1">
                <li className="px-3 py-2 text-sm text-zinc-400">
                  No workflow runs yet
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {collapsed && (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 [writing-mode:vertical-lr] rotate-180">
            History
          </span>
        </div>
      )}
    </aside>
  );
}
