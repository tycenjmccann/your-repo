'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  Bot,
  Wrench,
  GitBranch,
  Route,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/layout/sidebar/SidebarContext'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'Agents' },
  { href: '/build', icon: Wrench, label: 'Build' },
  { href: '/workflow', icon: GitBranch, label: 'Workflow' },
  { href: '/routing', icon: Route, label: 'Routing' },
  { href: '/ticket-history', icon: Ticket, label: 'Ticket History' },
]

export default function Sidebar() {
  const { isCollapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 overflow-hidden',
        'bg-[var(--surface-2)] border-r border-[var(--surface-3)]',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center h-14 px-4 border-b border-[var(--surface-3)]">
        <span className={cn('font-bold text-[var(--color-text-primary)] transition-all duration-300', isCollapsed && 'opacity-0 w-0 overflow-hidden')}>
          App
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-hidden" aria-label="Main navigation">
        {navItems.map(({ href, icon: Icon, label }) => (
          <div key={href} className="relative group px-2">
            <Link
              href={href}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium',
                'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--surface-3)]',
                'transition-colors duration-150'
              )}
              aria-label={label}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span
                className={cn(
                  'whitespace-nowrap transition-all duration-300',
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                )}
              >
                {label}
              </span>
            </Link>

            {isCollapsed && (
              <span
                className={cn(
                  'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50',
                  'px-2 py-1 rounded bg-[var(--surface-3)] text-[var(--color-text-primary)] text-xs whitespace-nowrap',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
                )}
                role="tooltip"
              >
                {label}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--surface-3)] p-2">
        <button
          onClick={toggle}
          className={cn(
            'flex items-center justify-center w-full p-2 rounded-md',
            'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--surface-3)]',
            'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)]'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </aside>
  )
}
