"use client";

import { useState, useRef, DragEvent, KeyboardEvent } from "react";

interface FileDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  onError: (message: string) => void;
  acceptedTypes: string[];
  children: React.ReactNode;
  disabled?: boolean;
}

export default function FileDropZone({
  onFilesDropped,
  onError,
  acceptedTypes,
  children,
  disabled = false,
}: FileDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const valid: File[] = [];
    const rejected: File[] = [];

    for (const file of files) {
      if (acceptedTypes.includes(file.type)) {
        valid.push(file);
      } else {
        rejected.push(file);
      }
    }

    if (valid.length > 0) onFilesDropped(valid);
    if (rejected.length > 0) {
      const names = rejected.map((f) => f.name).join(", ");
      onError(
        `Unsupported file type: ${names}. Only PNG, JPG, GIF, and WebP are accepted.`
      );
    }
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) onFilesDropped(files);
    e.target.value = "";
  }

  return (
    <div
      role="region"
      aria-label="Image upload drop zone. Accepts PNG, JPG, GIF, and WebP files."
      tabIndex={0}
      className={`border-2 border-dashed rounded-lg p-8 text-center min-h-[120px] transition-colors cursor-pointer ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-indigo-400"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <svg
        className="mx-auto h-10 w-10 text-gray-400 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className="text-sm font-medium text-gray-700">
        Drag &amp; drop images here
      </p>
      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP</p>
      {children}
    </div>
  );
}
