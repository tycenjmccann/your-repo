"use client";

import { useState, useEffect, useCallback } from "react";
import FileDropZone from "./FileDropZone";
import ImagePreview from "./ImagePreview";
import ClipboardPasteButton from "./ClipboardPasteButton";

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export default function IntakeCard() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onImagesAdded = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setAnnouncement(
      `${files.length} image${files.length > 1 ? "s" : ""} added.`
    );
  }, []);

  const onImageRemoved = useCallback((imageId: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === imageId);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== imageId);
    });
    setAnnouncement("Image removed.");
  }, []);

  function onError(message: string) {
    setError(message);
  }

  function onErrorDismiss() {
    setError(null);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">
        Image Intake
      </h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <FileDropZone
          onFilesDropped={onImagesAdded}
          onError={onError}
          acceptedTypes={ACCEPTED_TYPES}
        >
          <ClipboardPasteButton onImagePasted={(file) => onImagesAdded([file])} onError={onError} />
        </FileDropZone>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200"
          >
            <svg
              className="h-4 w-4 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <span className="text-xs text-red-700 font-medium flex-1">
              {error}
            </span>
            <button
              type="button"
              onClick={onErrorDismiss}
              className="text-red-500 hover:text-red-700 text-sm leading-none"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 mt-4">
            {images.map((image) => (
              <ImagePreview
                key={image.id}
                image={image}
                onRemove={onImageRemoved}
              />
            ))}
          </div>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
