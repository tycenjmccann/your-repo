'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  toggle: () => void
}

export const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  /**
   * FIX (TEAM-1052): Read the `data-sidebar` attribute that the anti-flash
   * inline script (in layout.tsx <head>) already set synchronously from
   * localStorage BEFORE React hydration.
   *
   * This eliminates the hydration flash caused by the previous broken pattern:
   *
   *   BROKEN:
   *   const [isCollapsed, setIsCollapsed] = useState(false)  // always expanded
   *   useEffect(() => {
   *     const stored = localStorage.getItem('sidebar-collapsed')
   *     if (stored !== null) setIsCollapsed(stored === 'true') // ← FLASH here
   *   }, [])
   *
   * The broken pattern guaranteed a flash because:
   *   1. SSR/hydration renders with isCollapsed=false (expanded)
   *   2. useEffect fires after paint → setIsCollapsed(true) → visible collapse
   *
   * FIXED: Lazy initializer reads the DOM attribute set by the anti-flash script.
   * React's first render already reflects the user's stored preference.
   * No post-hydration state update, no flash. AC5 satisfied.
   *
   * The useEffect that previously read localStorage has been intentionally
   * removed — it is no longer needed.
   */
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-sidebar') === 'collapsed'
    }
    return false
  })

  const toggle = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('sidebar-collapsed', String(next))
        document.documentElement.setAttribute('data-sidebar', next ? 'collapsed' : 'expanded')
      } catch (e) {
        // localStorage may be unavailable (private browsing, etc.)
      }
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
