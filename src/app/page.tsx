import { TicketBadges } from '@/components/dashboard/TicketBadges';

async function getTicketCounts() {
  // In a real app, this would call an internal API or database
  return {
    open: 12,
    inProgress: 5,
    resolved: 8,
    closed: 23,
  };
}

export default async function DashboardPage() {
  const initialCounts = await getTicketCounts();

  return (
    <main>
      <h1>Dashboard</h1>
      <TicketBadges initialCounts={initialCounts} />
    </main>
  );
}
