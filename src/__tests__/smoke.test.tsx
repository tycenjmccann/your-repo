import React from 'react'
import { render, screen } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '../components/layout/sidebar/SidebarContext'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function TestConsumer() {
  const { isCollapsed, toggle } = useSidebar()
  return (
    <div>
      <span data-testid="state">{isCollapsed ? 'collapsed' : 'expanded'}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

describe('SidebarContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('renders SidebarProvider without crashing', () => {
    const { container } = render(
      <SidebarProvider>
        <div>test child</div>
      </SidebarProvider>
    )
    expect(container).toBeTruthy()
  })

  it('provides default isCollapsed=false state', () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
  })

  it('useSidebar returns expected shape', () => {
    let contextValue: ReturnType<typeof useSidebar> | null = null

    function Capture() {
      contextValue = useSidebar()
      return null
    }

    render(
      <SidebarProvider>
        <Capture />
      </SidebarProvider>
    )

    expect(contextValue).not.toBeNull()
    expect(typeof contextValue!.isCollapsed).toBe('boolean')
    expect(typeof contextValue!.toggle).toBe('function')
  })
})
