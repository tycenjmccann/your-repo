"use client";

import { useState, useCallback, useRef } from "react";
import { UploadedImage } from "@/types/workflow";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export default function IntakeCard() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: File[]) => {
    setError(null);
    const validFiles = files.filter((f) => ACCEPTED_TYPES.includes(f.type));

    if (validFiles.length < files.length) {
      setError("Some files were skipped. Only PNG, JPG, GIF, and WebP are accepted.");
    }

    if (validFiles.length === 0) return;

    setIsLoading(true);
    const newImages: UploadedImage[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages((prev) => [...prev, ...newImages]);
    setIsLoading(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handlePaste = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (ACCEPTED_TYPES.includes(type)) {
            const blob = await item.getType(type);
            const file = new File([blob], `clipboard-${Date.now()}.${type.split("/")[1]}`, {
              type,
            });
            files.push(file);
          }
        }
      }

      if (files.length === 0) {
        setError("No image found in clipboard.");
      } else {
        processFiles(files);
      }
    } catch {
      setError("Failed to read clipboard. Please ensure clipboard permission is granted.");
    } finally {
      setIsLoading(false);
    }
  }, [processFiles]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(Array.from(e.target.files));
      }
    },
    [processFiles]
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Intake</h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Drop zone for mockup images"
        className={`flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mb-2 h-10 w-10 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-gray-600">
          Drag & drop mockup images here
        </p>
        <p className="mt-1 text-xs text-gray-400">
          PNG, JPG, GIF, or WebP
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
        >
          Browse files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          onChange={handleFileInput}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePaste}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0114.75 19h-9.5A2.25 2.25 0 013 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 019 1h2c1.373 0 2.531.923 2.887 2.182zM7.5 4A1.5 1.5 0 019 2.5h2A1.5 1.5 0 0112.5 4v.5h-5V4z"
              clipRule="evenodd"
            />
          </svg>
          Paste from clipboard
        </button>
        {isLoading && (
          <span className="text-sm text-gray-500" aria-live="polite">
            Processing...
          </span>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-gray-700">
            Uploaded Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200"
              >
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  aria-label={`Remove ${img.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3 w-3"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
                <p className="truncate px-2 py-1 text-xs text-gray-600">
                  {img.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
