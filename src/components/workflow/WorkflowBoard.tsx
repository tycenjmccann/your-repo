"use client";

import { WorkflowHistorySidebar } from "./WorkflowHistorySidebar";

export function WorkflowBoard() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <WorkflowHistorySidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-zinc-50">Workflow</h1>
      </main>
    </div>
  );
}
