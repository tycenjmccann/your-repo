'use client';

import { useState, useEffect } from 'react';

type WorkflowStatus = 'success' | 'failed' | 'in-progress';

interface WorkflowRun {
  id: string;
  title: string;
  date: Date;
  status: WorkflowStatus;
}

const mockWorkflowRuns: WorkflowRun[] = [
  { id: '1', title: 'Image Processing Pipeline', date: new Date('2026-05-28T14:34:00'), status: 'in-progress' },
  { id: '2', title: 'Data Export — Q2 Report', date: new Date('2026-05-28T11:02:00'), status: 'success' },
  { id: '3', title: 'User Auth Migration', date: new Date('2026-05-27T17:18:00'), status: 'failed' },
  { id: '4', title: 'Thumbnail Generation', date: new Date('2026-05-27T15:45:00'), status: 'success' },
  { id: '5', title: 'PDF Invoice Batch', date: new Date('2026-05-27T10:12:00'), status: 'success' },
  { id: '6', title: 'Email Campaign Assets', date: new Date('2026-05-26T16:30:00'), status: 'success' },
  { id: '7', title: 'Logo Resize Task', date: new Date('2026-05-26T09:15:00'), status: 'success' },
  { id: '8', title: 'Social Media Pack', date: new Date('2026-05-25T14:22:00'), status: 'success' },
  { id: '9', title: 'Product Photo Edits', date: new Date('2026-05-25T08:50:00'), status: 'failed' },
  { id: '10', title: 'Banner Ad Variations', date: new Date('2026-05-24T11:30:00'), status: 'success' },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' · ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const styles: Record<WorkflowStatus, string> = {
    success: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
    'in-progress': 'bg-yellow-50 text-yellow-700',
  };

  const labels: Record<WorkflowStatus, string> = {
    success: 'Success',
    failed: 'Failed',
    'in-progress': 'In Progress',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${styles[status]}`}
    >
      {status === 'in-progress' && (
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
      )}
      {labels[status]}
    </span>
  );
}

export default function HistorySidebar({ activeId = '1' }: { activeId?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('workflow-sidebar-collapsed');
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('workflow-sidebar-collapsed', String(next));
  };

  if (!mounted) {
    return <aside className="w-[280px] border-r border-gray-200 bg-white" />;
  }

  return (
    <aside
      role="complementary"
      aria-label="Workflow history"
      className={`relative flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden ${
        collapsed ? 'w-12' : 'w-[280px]'
      }`}
    >
      {collapsed ? (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">History</h2>
            <button
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockWorkflowRuns.map((run) => {
              const isActive = run.id === activeId;
              return (
                <div
                  key={run.id}
                  aria-current={isActive ? 'true' : undefined}
                  className={`px-4 py-3 cursor-pointer border-l-[3px] ${
                    isActive
                      ? 'border-l-blue-500 bg-blue-50'
                      : 'border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {run.title}
                    </span>
                    <StatusBadge status={run.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(run.date)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
