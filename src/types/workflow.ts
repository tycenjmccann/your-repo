export interface WorkflowRun {
  id: string;
  title: string;
  date: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}
