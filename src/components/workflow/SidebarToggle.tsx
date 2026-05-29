'use client';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function SidebarToggle({ isCollapsed, onToggle, disabled }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={[
        'w-8 h-8 rounded-md flex items-center justify-center',
        'bg-transparent hover:bg-slate-700',
        'transition-[background] duration-150 ease-in-out motion-reduce:transition-none',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:pointer-events-none',
      ].join(' ')}
    >
      {isCollapsed ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-slate-400 hover:text-slate-200"
        >
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-slate-400 hover:text-slate-200"
        >
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
