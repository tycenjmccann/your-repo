'use client';

import { IntakeCard } from './IntakeCard';

export default function WorkflowBoard() {
  return (
    <div className="flex flex-col items-center gap-6">
      <IntakeCard cardId="intake-card-1" title="Upload Images" />
    </div>
  );
}
