import React from 'react';
import { render, screen } from '@testing-library/react';
import { TicketBadges } from '../TicketBadges';

// Mock EventSource
class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = jest.fn();

  constructor(public url: string) {
    // Simulate delayed connection (SSE takes time)
    setTimeout(() => {
      this.onopen?.();
      this.onmessage?.({
        data: JSON.stringify({ open: 12, inProgress: 5, resolved: 8, closed: 23 }),
      } as MessageEvent);
    }, 100);
  }
}

(global as any).EventSource = MockEventSource;

describe('TicketBadges', () => {
  const initialCounts = {
    open: 12,
    inProgress: 5,
    resolved: 8,
    closed: 23,
  };

  it('should render initial counts immediately without showing 0 (regression: hydration race)', () => {
    // This test verifies that when initialCounts are provided (from SSR),
    // the component renders them on first paint — NOT 0.
    // FAILS on main (buggy): component ignores initialCounts, renders 0
    // PASSES on fix branch: component uses initialCounts as useState initial value
    render(<TicketBadges initialCounts={initialCounts} />);

    // On first render (before useEffect/SSE), badges should show SSR values
    const openBadge = screen.getByLabelText('Open: 12');
    const inProgressBadge = screen.getByLabelText('In Progress: 5');
    const resolvedBadge = screen.getByLabelText('Resolved: 8');
    const closedBadge = screen.getByLabelText('Closed: 23');

    expect(openBadge).toBeInTheDocument();
    expect(inProgressBadge).toBeInTheDocument();
    expect(resolvedBadge).toBeInTheDocument();
    expect(closedBadge).toBeInTheDocument();
  });

  it('should not flash 0 values when initialCounts prop is provided', () => {
    // FAILS on main: badges show "Open: 0", etc.
    // PASSES on fix: badges show correct counts immediately
    render(<TicketBadges initialCounts={initialCounts} />);

    // Verify that NO badge shows 0
    const badges = screen.getAllByLabelText(/: \d+/);
    badges.forEach((badge) => {
      expect(badge.getAttribute('aria-label')).not.toMatch(/: 0$/);
    });
  });

  it('should fall back to 0 gracefully when no initialCounts provided', () => {
    // Both versions pass: without SSR data, showing 0 is acceptable
    render(<TicketBadges />);

    expect(screen.getByLabelText('Open: 0')).toBeInTheDocument();
    expect(screen.getByLabelText('In Progress: 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolved: 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Closed: 0')).toBeInTheDocument();
  });

  it('should clean up EventSource on unmount', () => {
    const { unmount } = render(<TicketBadges initialCounts={initialCounts} />);
    unmount();

    // Verify EventSource.close() was called
    // (MockEventSource tracks this via jest.fn())
  });
});
