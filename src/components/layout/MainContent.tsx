'use client'

import { ReactNode } from 'react'
import { useSidebar } from '@/components/layout/sidebar/SidebarContext'
import { cn } from '@/lib/utils'

export default function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar()
  return (
    <main
      className={cn(
        'min-h-screen transition-all duration-300',
        isCollapsed ? 'ml-16' : 'ml-64'
      )}
    >
      {children}
    </main>
  )
}
