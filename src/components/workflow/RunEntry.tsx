'use client';

import { WorkflowRun } from './types';
import { StatusIndicator } from './StatusIndicator';
import { getRelativeDate } from '@/utils/dates';

interface RunEntryProps {
  run: WorkflowRun;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
}

export function RunEntry({ run, isActive, isCollapsed, onSelect }: RunEntryProps) {
  const relativeDate = getRelativeDate(run.date);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  const baseClasses = [
    'flex flex-row gap-3 items-center rounded-md',
    'px-3 py-[10px]',
    'transition-[background] duration-150 ease-in-out motion-reduce:transition-none',
    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
    'cursor-pointer',
  ].join(' ');

  const stateClasses = isActive
    ? 'bg-slate-800/80 border-l-[3px] border-blue-500 !rounded-l-none rounded-r-md'
    : 'hover:bg-slate-800';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`${baseClasses} ${stateClasses}`}
      aria-label={`${run.title}, ${run.status}, ${relativeDate}`}
    >
      <StatusIndicator status={run.status} />
      <div
        className={`flex flex-col min-w-0 transition-[opacity,width] duration-150 ease-in-out motion-reduce:transition-none ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
        }`}
      >
        <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
          {run.title}
        </span>
        <span className="text-xs text-slate-500">{relativeDate}</span>
      </div>
    </div>
  );
}
