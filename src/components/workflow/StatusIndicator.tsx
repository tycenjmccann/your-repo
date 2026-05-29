'use client';

import { WorkflowRun } from './types';

interface StatusIndicatorProps {
  status: WorkflowRun['status'];
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const baseClasses = 'w-2 h-2 rounded-full flex-shrink-0';

  const statusClasses: Record<WorkflowRun['status'], string> = {
    success: 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]',
    failure: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]',
    'in-progress': 'bg-blue-500 animate-pulse',
  };

  return (
    <span
      className={`${baseClasses} ${statusClasses[status]}`}
      aria-hidden="true"
    />
  );
}
