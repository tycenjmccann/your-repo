"use client";

import { useState, useEffect } from "react";

interface ClipboardPasteButtonProps {
  onImagePasted: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export default function ClipboardPasteButton({
  onImagePasted,
  onError,
  disabled = false,
}: ClipboardPasteButtonProps) {
  const [clipboardSupported, setClipboardSupported] = useState(true);

  useEffect(() => {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      setClipboardSupported(false);
    }
  }, []);

  async function handlePaste() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split("/")[1];
          const file = new File([blob], `pasted-image.${ext}`, {
            type: imageType,
          });
          onImagePasted(file);
          return;
        }
      }
      onError("No image found in clipboard.");
    } catch {
      onError(
        "Clipboard access denied. Please allow clipboard permissions."
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handlePaste}
      disabled={disabled || !clipboardSupported}
      aria-label="Paste image from clipboard"
      title={
        !clipboardSupported
          ? "Clipboard API not supported in this browser."
          : undefined
      }
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
    >
      <svg
        className="h-4 w-4 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      Paste from clipboard
    </button>
  );
}
