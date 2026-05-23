"use client";

import { useState, useEffect } from "react";
import { WorkflowRun } from "@/types/workflow";

interface WorkflowHistorySidebarProps {
  runs: WorkflowRun[];
  activeRunId: string;
  onSelectRun?: (id: string) => void;
}

const STORAGE_KEY = "workflow-sidebar-collapsed";

const statusColors: Record<WorkflowRun["status"], string> = {
  completed: "bg-green-100 text-green-800",
  running: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-gray-100 text-gray-800",
};

export default function WorkflowHistorySidebar({
  runs,
  activeRunId,
  onSelectRun,
}: WorkflowHistorySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <aside
      role="complementary"
      aria-label="Workflow history sidebar"
      className={`relative flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300 motion-reduce:transition-none ${
        collapsed ? "w-12" : "w-72"
      }`}
    >
      <button
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${
            collapsed ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {!collapsed && (
        <div className="h-full overflow-y-auto p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Recent Runs
          </h2>
          <ul className="space-y-2">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  onClick={() => onSelectRun?.(run.id)}
                  className={`w-full rounded-lg p-3 text-left transition-colors duration-150 ${
                    run.id === activeRunId
                      ? "bg-blue-50 ring-2 ring-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  aria-current={run.id === activeRunId ? "true" : undefined}
                >
                  <p className="truncate text-sm font-medium text-gray-900">
                    {run.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{run.date}</p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[run.status]}`}
                  >
                    {run.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
