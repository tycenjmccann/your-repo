export interface WorkflowRun {
  id: string;
  title: string;
  date: string; // ISO 8601
  status: 'success' | 'failure' | 'in-progress';
}

export interface HistorySidebarProps {
  runs: WorkflowRun[];
  activeRunId?: string;
  onRunSelect: (id: string) => void;
}
