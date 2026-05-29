'use client';

import { useState, useEffect, useCallback } from 'react';
import { HistorySidebarProps } from './types';
import { RunEntry } from './RunEntry';
import { SidebarToggle } from './SidebarToggle';
import { readLocalStorage, writeLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'workflow-sidebar-collapsed';

export function HistorySidebar({ runs, activeRunId, onRunSelect }: HistorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return readLocalStorage(STORAGE_KEY, 'false') === 'true';
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setIsMobile(true);
        setIsCollapsed(true);
      } else {
        setIsMobile(false);
        const stored = readLocalStorage(STORAGE_KEY, 'false');
        setIsCollapsed(stored === 'true');
      }
    };

    handleChange(mql);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeLocalStorage(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Workflow history"
      className={[
        'h-screen sticky top-0 z-20',
        'bg-slate-900 border-r border-slate-700',
        'transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
        'flex flex-col',
        isCollapsed ? 'w-12 p-2 overflow-hidden' : 'w-[280px] p-3 overflow-y-auto',
      ].join(' ')}
    >
      <div
        className={`flex mb-2 ${
          isCollapsed ? 'justify-center' : 'justify-end'
        }`}
      >
        {!isMobile && (
          <SidebarToggle
            isCollapsed={isCollapsed}
            onToggle={handleToggle}
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        {runs.map((run) => (
          <RunEntry
            key={run.id}
            run={run}
            isActive={run.id === activeRunId}
            isCollapsed={isCollapsed}
            onSelect={() => onRunSelect(run.id)}
          />
        ))}
      </div>
    </nav>
  );
}
