"use client";

import IntakeCard from "./IntakeCard";

export default function WorkflowBoard() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Workflow Board</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <IntakeCard />
      </div>
    </div>
  );
}
