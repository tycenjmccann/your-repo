"use client";

import { useState } from "react";
import WorkflowHistorySidebar from "@/components/workflow/WorkflowHistorySidebar";
import WorkflowBoard from "@/components/workflow/WorkflowBoard";
import { WorkflowRun } from "@/types/workflow";

const mockRuns: WorkflowRun[] = [
  { id: "run-1", title: "Homepage Redesign", date: "2026-05-23", status: "running" },
  { id: "run-2", title: "User Onboarding Flow", date: "2026-05-22", status: "completed" },
  { id: "run-3", title: "Payment Integration", date: "2026-05-21", status: "completed" },
  { id: "run-4", title: "Search Feature Update", date: "2026-05-20", status: "failed" },
  { id: "run-5", title: "Dashboard Analytics", date: "2026-05-19", status: "completed" },
  { id: "run-6", title: "Mobile Navigation", date: "2026-05-18", status: "pending" },
  { id: "run-7", title: "Email Templates", date: "2026-05-17", status: "completed" },
  { id: "run-8", title: "API Rate Limiting", date: "2026-05-16", status: "completed" },
  { id: "run-9", title: "Dark Mode Support", date: "2026-05-15", status: "failed" },
  { id: "run-10", title: "Accessibility Audit", date: "2026-05-14", status: "pending" },
];

export default function WorkflowPage() {
  const [activeRunId, setActiveRunId] = useState(mockRuns[0].id);

  return (
    <div className="flex h-screen bg-gray-50">
      <WorkflowHistorySidebar
        runs={mockRuns}
        activeRunId={activeRunId}
        onSelectRun={setActiveRunId}
      />
      <WorkflowBoard />
    </div>
  );
}
