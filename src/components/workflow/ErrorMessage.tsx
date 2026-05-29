'use client';

import { useEffect } from 'react';
import { ErrorMessageProps } from './types';

export function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [error, onDismiss]);

  const isWarning = error.type === 'clipboard-empty';

  const containerClasses = isWarning
    ? 'flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 mt-3'
    : 'flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 mt-3';

  const iconColor = isWarning ? 'text-amber-500' : 'text-red-500';
  const textColor = isWarning ? 'text-amber-800' : 'text-red-800';

  return (
    <div role="alert" aria-live="assertive" className={containerClasses}>
      {isWarning ? (
        <svg
          className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : (
        <svg
          className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      )}
      <p className={`text-sm ${textColor} flex-1`}>{error.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className={`flex-shrink-0 ${textColor} hover:opacity-70`}
        aria-label="Dismiss error message"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
