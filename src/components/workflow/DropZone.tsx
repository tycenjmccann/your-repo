'use client';

import { useRef } from 'react';
import { DropZoneProps } from './types';

export function DropZone({
  dragOver,
  error,
  disabled,
  onDragOver,
  onDragLeave,
  onDrop,
  onClickBrowse,
}: DropZoneProps) {
  const statusRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClickBrowse();
    }
  };

  const baseClasses =
    'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-all duration-200 ease-in-out cursor-pointer min-h-[120px]';

  let stateClasses: string;
  if (error) {
    stateClasses = 'border-red-400 bg-red-50';
  } else if (dragOver) {
    stateClasses = 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 scale-[1.01]';
  } else {
    stateClasses = 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100';
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop zone for uploading images. Supported formats: PNG, JPG, GIF, WebP"
      className={`${baseClasses} ${stateClasses}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {dragOver ? (
        <>
          <svg
            className="w-8 h-8 text-blue-500 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-blue-600">Release to upload</p>
        </>
      ) : (
        <>
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-gray-600">Drag & drop images here</p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP</p>
        </>
      )}
      <div ref={statusRef} aria-live="polite" className="sr-only">
        {dragOver ? 'Files detected. Release to upload.' : ''}
      </div>
    </div>
  );
}
