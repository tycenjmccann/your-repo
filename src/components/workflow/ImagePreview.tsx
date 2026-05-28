"use client";

interface ImagePreviewProps {
  image: { id: string; previewUrl: string; name: string };
  onRemove: (imageId: string) => void;
}

export default function ImagePreview({ image, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative max-w-[200px] rounded-md overflow-hidden border border-gray-200">
      <img
        src={image.previewUrl}
        alt={`Preview of ${image.name}`}
        className="w-full h-auto object-cover aspect-square"
      />
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        aria-label={`Remove ${image.name}`}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center text-xs leading-none"
      >
        &times;
      </button>
    </div>
  );
}
