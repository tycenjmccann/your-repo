'use client';

import { PasteButtonProps } from './types';

export function PasteButton({ disabled, onClick }: PasteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Paste image from clipboard"
      title={disabled ? 'Clipboard API not available in this browser' : undefined}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled
          ? 'opacity-60 cursor-not-allowed bg-gray-100'
          : 'hover:bg-gray-50 hover:border-gray-400'
      }`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      Paste from clipboard
    </button>
  );
}
