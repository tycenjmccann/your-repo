"use client";

import { WorkflowRun, WorkflowStatus } from "@/types/workflow";

interface HistorySidebarProps {
  runs: WorkflowRun[];
  activeRunId: string;
  collapsed: boolean;
  onToggle: () => void;
  onSelectRun: (id: string) => void;
}

function formatDate(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${year} \u2022 ${hours}:${minutes}`;
}

function StatusIcon({ status }: { status: WorkflowStatus }) {
  if (status === "success") {
    return (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8 15A7 7 0 108 1a7 7 0 000 14zm2.78-9.78a.75.75 0 00-1.06-1.06L8 5.94 6.28 4.22a.75.75 0 00-1.06 1.06L6.94 7 5.22 8.72a.75.75 0 101.06 1.06L8 8.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 7l1.72-1.78z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="24"
        strokeDashoffset="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const colorClasses: Record<WorkflowStatus, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    running: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses[status]}`}
      aria-label={`Status: ${status}`}
    >
      <StatusIcon status={status} />
      {status}
    </span>
  );
}

function WorkflowRunEntry({
  run,
  isActive,
  onSelect,
}: {
  run: WorkflowRun;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      className={`w-full text-left px-3 py-2.5 ${
        isActive
          ? "bg-blue-50 border-l-[3px] border-indigo-500"
          : "hover:bg-gray-50 border-l-[3px] border-transparent"
      }`}
    >
      <p
        className={`text-sm font-medium truncate ${
          isActive ? "text-gray-900" : "text-gray-700"
        }`}
      >
        {run.title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{formatDate(run.date)}</p>
      <div className="mt-1">
        <StatusBadge status={run.status} />
      </div>
    </button>
  );
}

function SidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-controls="history-sidebar"
      aria-label={collapsed ? "Expand history sidebar" : "Collapse history sidebar"}
      className="p-1 rounded hover:bg-gray-200 text-gray-500"
    >
      {collapsed ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

function CollapsedRail({
  runs,
  activeRunId,
  onSelectRun,
}: {
  runs: WorkflowRun[];
  activeRunId: string;
  onSelectRun: (id: string) => void;
}) {
  const statusColor: Record<WorkflowStatus, string> = {
    success: "text-green-700",
    failed: "text-red-700",
    running: "text-amber-700",
  };

  return (
    <div className="flex flex-col items-center gap-1 pt-2">
      {runs.map((run) => {
        const isActive = run.id === activeRunId;
        return (
          <button
            key={run.id}
            type="button"
            onClick={() => onSelectRun(run.id)}
            aria-label={run.title}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              isActive
                ? "bg-blue-50 border-l-[3px] border-indigo-500"
                : "hover:bg-gray-100"
            } ${statusColor[run.status]}`}
          >
            <StatusIcon status={run.status} />
          </button>
        );
      })}
    </div>
  );
}

export default function HistorySidebar({
  runs,
  activeRunId,
  collapsed,
  onToggle,
  onSelectRun,
}: HistorySidebarProps) {
  return (
    <aside
      id="history-sidebar"
      role="complementary"
      aria-label="Workflow run history"
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 ${
        collapsed ? "w-12" : "w-[280px]"
      } transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        <span
          className={`text-sm font-semibold text-gray-900 ${
            collapsed
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          } transition-opacity duration-150 ease-out`}
        >
          History
        </span>
        <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
      </div>

      <div
        className={`${
          collapsed
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        } transition-opacity duration-150 ease-out`}
      >
        <div className="overflow-y-auto">
          {runs.map((run) => (
            <WorkflowRunEntry
              key={run.id}
              run={run}
              isActive={run.id === activeRunId}
              onSelect={() => onSelectRun(run.id)}
            />
          ))}
        </div>
      </div>

      {collapsed && (
        <CollapsedRail
          runs={runs}
          activeRunId={activeRunId}
          onSelectRun={onSelectRun}
        />
      )}
    </aside>
  );
}
