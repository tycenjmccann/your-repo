'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IntakeCardProps, UploadedImage, ErrorState } from './types';
import { DropZone } from './DropZone';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { PasteButton } from './PasteButton';
import { ErrorMessage } from './ErrorMessage';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function IntakeCard({ cardId, title, onImagesChange }: IntakeCardProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [clipboardAvailable, setClipboardAvailable] = useState(false);

  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setClipboardAvailable(typeof navigator?.clipboard?.read === 'function');
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  const processFiles = useCallback((files: File[]) => {
    const invalidType: string[] = [];
    const tooLarge: string[] = [];
    const valid: File[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        invalidType.push(file.name);
      } else if (file.size > MAX_FILE_SIZE) {
        tooLarge.push(file.name);
      } else {
        valid.push(file);
      }
    }

    if (invalidType.length > 0) {
      setError({
        type: 'invalid-file-type',
        message: `Unsupported file type: ${invalidType.join(', ')}. Only PNG, JPG, GIF, and WebP are accepted.`,
        files: invalidType,
      });
      return;
    }

    if (tooLarge.length > 0) {
      setError({
        type: 'file-too-large',
        message: `File too large: ${tooLarge.join(', ')}. Maximum size is 10MB.`,
        files: tooLarge,
      });
      return;
    }

    const newImages: UploadedImage[] = valid.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        objectUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: Date.now(),
      };
    });

    setImages((prev) => [...prev, ...newImages]);
    setError(null);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleClickBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (ACCEPTED_TYPES.includes(type)) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image.${type.split('/')[1]}`, { type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length === 0) {
        setError({
          type: 'clipboard-empty',
          message: 'No image found in clipboard. Copy an image first.',
        });
        return;
      }

      processFiles(imageFiles);
    } catch {
      setError({
        type: 'clipboard-empty',
        message: 'Unable to read clipboard. Make sure you have copied an image.',
      });
    }
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.objectUrl);
        objectUrlsRef.current.delete(image.objectUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div
      id={cardId}
      className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>

      <DropZone
        dragOver={dragOver}
        error={error}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClickBrowse={handleClickBrowse}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && <ErrorMessage error={error} onDismiss={handleDismissError} />}

      <div className="mt-3">
        <PasteButton disabled={!clipboardAvailable} onClick={handlePaste} />
      </div>

      <ImagePreviewGrid images={images} onRemove={handleRemove} />
    </div>
  );
}
