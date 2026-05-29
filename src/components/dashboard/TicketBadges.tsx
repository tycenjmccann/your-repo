'use client';

import React, { useState, useEffect } from 'react';

interface TicketCounts {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface TicketBadgesProps {
  initialCounts?: TicketCounts;
}

const defaultCounts: TicketCounts = {
  open: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
};

export function TicketBadges({ initialCounts }: TicketBadgesProps) {
  const [counts, setCounts] = useState<TicketCounts>(initialCounts ?? defaultCounts);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // SSE subscription to get real-time ticket counts
    const eventSource = new EventSource('/api/tickets/counts');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: TicketCounts = JSON.parse(event.data);
        setCounts(data);
      } catch (e) {
        console.error('Failed to parse ticket counts:', e);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="ticket-badges" role="group" aria-label="Ticket counts">
      <Badge label="Open" count={counts.open} variant="warning" />
      <Badge label="In Progress" count={counts.inProgress} variant="info" />
      <Badge label="Resolved" count={counts.resolved} variant="success" />
      <Badge label="Closed" count={counts.closed} variant="default" />
      {!isConnected && (
        <span className="connection-status" aria-live="polite">
          Reconnecting...
        </span>
      )}
    </div>
  );
}

interface BadgeProps {
  label: string;
  count: number;
  variant: 'warning' | 'info' | 'success' | 'default';
}

function Badge({ label, count, variant }: BadgeProps) {
  return (
    <div className={`badge badge--${variant}`} aria-label={`${label}: ${count}`}>
      <span className="badge__label">{label}</span>
      <span className="badge__count">{count}</span>
    </div>
  );
}

export default TicketBadges;
