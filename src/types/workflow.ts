export type WorkflowStatus = "success" | "failed" | "running";

export interface WorkflowRun {
  id: string;
  title: string;
  date: Date;
  status: WorkflowStatus;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}
