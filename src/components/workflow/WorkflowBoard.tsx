"use client";

import { useState } from "react";
import { useCollapsedState } from "@/hooks/useCollapsedState";
import { mockWorkflowRuns } from "@/data/mockWorkflowRuns";
import HistorySidebar from "@/components/workflow/HistorySidebar";
import IntakeCard from "@/components/workflow/IntakeCard";

export function WorkflowBoard() {
  const [collapsed, toggle] = useCollapsedState();
  const [activeRunId, setActiveRunId] = useState<string>(
    mockWorkflowRuns[0].id
  );

  return (
    <div className="flex min-h-screen">
      <HistorySidebar
        runs={mockWorkflowRuns}
        activeRunId={activeRunId}
        collapsed={collapsed}
        onToggle={toggle}
        onSelectRun={setActiveRunId}
      />
      <main
        className={`flex-1 p-6 bg-gray-50 ${
          collapsed ? "ml-12" : "ml-[280px]"
        } transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}
      >
        <div className="max-w-2xl mx-auto">
          <IntakeCard />
        </div>
      </main>
    </div>
  );
}

export default WorkflowBoard;
