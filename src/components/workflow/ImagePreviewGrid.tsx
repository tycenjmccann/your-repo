'use client';

import { useRef, useCallback } from 'react';
import { ImagePreviewGridProps } from './types';

export function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setButtonRef = useCallback(
    (id: string) => (el: HTMLButtonElement | null) => {
      if (el) {
        buttonRefs.current.set(id, el);
      } else {
        buttonRefs.current.delete(id);
      }
    },
    []
  );

  const handleRemove = (id: string, index: number) => {
    onRemove(id);
    requestAnimationFrame(() => {
      const remainingIds = images.filter((img) => img.id !== id).map((img) => img.id);
      const nextIndex = Math.min(index, remainingIds.length - 1);
      if (nextIndex >= 0) {
        const nextId = remainingIds[nextIndex];
        buttonRefs.current.get(nextId)?.focus();
      }
    });
  };

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="group relative rounded-md overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 aspect-square"
        >
          <img
            src={image.objectUrl}
            alt={`Uploaded image: ${image.fileName}`}
            className="object-cover w-full h-full"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
          <button
            ref={setButtonRef(image.id)}
            type="button"
            onClick={() => handleRemove(image.id, index)}
            className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-sm"
            aria-label={`Remove image: ${image.fileName}`}
          >
            <svg
              className="w-4 h-4 text-gray-600"
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
      ))}
    </div>
  );
}
