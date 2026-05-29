'use client';

import { useState } from 'react';
import { HistorySidebar } from '@/components/workflow/HistorySidebar';
import { WorkflowRun } from '@/components/workflow/types';

const MOCK_RUNS: WorkflowRun[] = [
  { id: 'run-1', title: 'Production Deploy v2.4.1', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'in-progress' },
  { id: 'run-2', title: 'Staging Environment Update', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'success' },
  { id: 'run-3', title: 'Database Migration #47', date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'success' },
  { id: 'run-4', title: 'API Gateway Config Change', date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), status: 'failure' },
  { id: 'run-5', title: 'Cache Invalidation Job', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'success' },
  { id: 'run-6', title: 'Security Patch Rollout', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'success' },
  { id: 'run-7', title: 'CDN Configuration Update', date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), status: 'failure' },
  { id: 'run-8', title: 'Service Mesh Deployment', date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), status: 'success' },
  { id: 'run-9', title: 'Load Balancer Scaling', date: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), status: 'success' },
  { id: 'run-10', title: 'Infrastructure Terraform Apply', date: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(), status: 'success' },
];

export default function WorkflowPage() {
  const [activeRunId, setActiveRunId] = useState(MOCK_RUNS[0].id);

  const activeRun = MOCK_RUNS.find((run) => run.id === activeRunId);

  return (
    <div className="flex h-screen">
      <HistorySidebar
        runs={MOCK_RUNS}
        activeRunId={activeRunId}
        onRunSelect={setActiveRunId}
      />
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Workflow</h1>
        {activeRun && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Active Run</p>
            <p className="text-lg font-medium text-gray-800">{activeRun.title}</p>
            <p className="text-sm text-gray-500 mt-2">
              Status: <span className="font-medium">{activeRun.status}</span>
            </p>
            <p className="text-sm text-gray-500">
              ID: <span className="font-mono">{activeRun.id}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
