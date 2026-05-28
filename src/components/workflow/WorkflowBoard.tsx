'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  name: string;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function WorkflowBoard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clipboardErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
      if (dragErrorTimeoutRef.current) clearTimeout(dragErrorTimeoutRef.current);
      if (clipboardErrorTimeoutRef.current) clearTimeout(clipboardErrorTimeoutRef.current);
    };
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type));
    const invalid = files.filter((f) => !ACCEPTED_TYPES.includes(f.type));

    if (invalid.length > 0) {
      setDragError(`${invalid[0].name} was rejected — only image files are accepted`);
      if (dragErrorTimeoutRef.current) clearTimeout(dragErrorTimeoutRef.current);
      dragErrorTimeoutRef.current = setTimeout(() => setDragError(null), 4000);
    }

    if (valid.length > 0) {
      const newFiles: UploadedFile[] = valid.map((file) => ({
        id: crypto.randomUUID?.() ?? Date.now().toString() + Math.random().toString(36),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const removeAll = useCallback(() => {
    setUploadedFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.url));
      return [];
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFiles(files);
    e.target.value = '';
  }, [addFiles]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `clipboard-${Date.now()}.png`, { type: imageType });
          addFiles([file]);
          foundImage = true;
          break;
        }
      }
      if (!foundImage) {
        setClipboardError(true);
        if (clipboardErrorTimeoutRef.current) clearTimeout(clipboardErrorTimeoutRef.current);
        clipboardErrorTimeoutRef.current = setTimeout(() => setClipboardError(false), 4000);
      }
    } catch {
      setClipboardError(true);
      if (clipboardErrorTimeoutRef.current) clearTimeout(clipboardErrorTimeoutRef.current);
      clipboardErrorTimeoutRef.current = setTimeout(() => setClipboardError(false), 4000);
    }
  }, [addFiles]);

  const hasFiles = uploadedFiles.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Upload Images</h3>

      {/* Drop Zone */}
      {hasFiles ? (
        <div
          role="button"
          aria-label="Upload images drop zone"
          tabIndex={0}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm text-gray-600">Add more images</span>
          </div>
        </div>
      ) : (
        <div
          role="button"
          aria-label="Upload images drop zone"
          tabIndex={0}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className={`mx-auto w-10 h-10 mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {isDragOver ? (
            <p className="text-sm font-medium text-blue-600">Drop images to upload</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Drag & drop images here</p>
              <p className="text-sm text-gray-500 mt-1">
                or <span className="text-blue-600 underline">click to browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF, WebP, SVG</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label="Select image files"
        onChange={handleFileInput}
      />

      {/* Drag Error */}
      {dragError && (
        <div className="flex items-center gap-2 mt-3">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-red-600">{dragError}</span>
        </div>
      )}

      {/* Thumbnails */}
      {hasFiles && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} uploaded
            </span>
            <button
              type="button"
              className="text-xs text-red-500 hover:text-red-700 font-medium"
              aria-label="Remove all uploaded images"
              onClick={removeAll}
            >
              Remove all
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="group relative">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-500">
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(file.id)}
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-[11px] text-gray-500 truncate mt-1">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paste from Clipboard */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Paste image from clipboard"
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            clipboardError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={handlePaste}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste from clipboard
        </button>
        <span className="text-xs text-gray-400">or press Ctrl+V</span>
      </div>
      {clipboardError && (
        <div className="flex items-center gap-2 mt-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-red-600">No image found in clipboard</span>
        </div>
      )}
    </div>
  );
}
