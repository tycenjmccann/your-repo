'use client';

import HistorySidebar from '@/components/workflow/HistorySidebar';
import WorkflowBoard from '@/components/workflow/WorkflowBoard';

export default function WorkflowPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Workflow Management</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <HistorySidebar />
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">New Workflow</h2>
            <p className="text-sm text-gray-500 mb-6">Upload images to start a new processing workflow</p>
            <WorkflowBoard />
          </div>
        </main>
      </div>
    </div>
  );
}
