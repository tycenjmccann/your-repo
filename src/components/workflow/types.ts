export interface UploadedImage {
  id: string;
  objectUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number;
}

export interface ErrorState {
  type: 'invalid-file-type' | 'clipboard-empty' | 'file-too-large';
  message: string;
  files?: string[];
}

export interface IntakeCardProps {
  cardId: string;
  title: string;
  onImagesChange?: (images: UploadedImage[]) => void;
}

export interface DropZoneProps {
  dragOver: boolean;
  error: ErrorState | null;
  disabled?: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClickBrowse: () => void;
}

export interface ImagePreviewGridProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export interface ImagePreviewItemProps {
  image: UploadedImage;
  onRemove: () => void;
}

export interface PasteButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export interface ErrorMessageProps {
  error: ErrorState;
  onDismiss: () => void;
}
