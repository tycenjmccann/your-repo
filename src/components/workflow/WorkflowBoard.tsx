'use client';

import React from 'react';
import {
  PIPELINE_PHASES,
  PhaseDisplayMeta,
  getPhaseToolCount,
  getPhaseAgentDisplay,
} from '@/lib/pipeline-config';

interface WorkflowBoardProps {
  activePhaseId?: string;
}

function PhaseCard({
  phase,
  isActive,
}: {
  phase: PhaseDisplayMeta;
  isActive: boolean;
}) {
  const agentDisplay = getPhaseAgentDisplay(phase);
  const toolCount = getPhaseToolCount(phase);
  const skillCount = phase.skills.length;

  return (
    <div
      className={`
        relative flex-shrink-0 w-72 rounded-xl border p-5
        transition-all duration-300 ease-in-out
        ${isActive
          ? 'border-orange-500/60 shadow-[0_0_24px_rgba(249,115,22,0.15)] bg-zinc-900/95'
          : 'border-zinc-700/50 bg-zinc-900/70 hover:border-zinc-600/60'
        }
      `}
    >
      {/* Phase number - sub-hero */}
      <p className="text-lg font-semibold uppercase tracking-wider text-zinc-400 mb-1">
        Phase {phase.phase}
      </p>

      {/* Phase name - hero text */}
      <h3 className="text-2xl font-bold text-white mb-4">{phase.name}</h3>

      {/* Agent counts */}
      <div className="mb-3 space-y-0.5">
        {agentDisplay.type === 'app' ? (
          <p className="text-sm text-zinc-300">{agentDisplay.label}</p>
        ) : (
          <>
            <p className="text-sm text-zinc-300">
              {agentDisplay.runtime} AgentCore Runtime Agents
            </p>
            <p className="text-sm text-zinc-300">
              {agentDisplay.harness} AgentCore Harness Agents
            </p>
          </>
        )}
      </div>

      {/* Models */}
      <div className="mb-3 space-y-0.5">
        {phase.models.map((model) => (
          <p key={model} className="text-sm text-zinc-400">
            {model}
          </p>
        ))}
      </div>

      {/* Tools & Skills */}
      <div className="mb-3 space-y-0.5">
        <p className="text-sm text-zinc-300">{toolCount} Tools</p>
        <p className="text-sm text-zinc-300">{skillCount} Skills</p>
      </div>

      {/* Evaluations */}
      <div className="mt-auto pt-2 border-t border-zinc-700/40">
        {phase.evaluationsEnabled ? (
          <p className="text-sm text-emerald-400 flex items-center gap-1.5">
            Evaluations: Active
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          </p>
        ) : (
          <p className="text-sm text-zinc-500 flex items-center gap-1.5">
            Evaluations: Off
            <span className="inline-block w-2 h-2 rounded-full border border-zinc-500" />
          </p>
        )}
      </div>
    </div>
  );
}

export default function WorkflowBoard({ activePhaseId }: WorkflowBoardProps) {
  return (
    <section className="w-full">
      {/* Phase cards - horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-600">
        {PIPELINE_PHASES.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isActive={phase.id === activePhaseId}
          />
        ))}
      </div>
    </section>
  );
}
