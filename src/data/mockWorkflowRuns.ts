import { WorkflowRun } from "@/types/workflow";

export const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: "run-1",
    title: "Thumbnail generation",
    date: new Date("2026-05-28T14:50:00"),
    status: "running",
  },
  {
    id: "run-2",
    title: "Product photos batch",
    date: new Date("2026-05-28T14:32:00"),
    status: "success",
  },
  {
    id: "run-3",
    title: "Banner resize workflow",
    date: new Date("2026-05-27T09:15:00"),
    status: "success",
  },
  {
    id: "run-4",
    title: "Logo extraction",
    date: new Date("2026-05-26T11:00:00"),
    status: "failed",
  },
  {
    id: "run-5",
    title: "Watermark removal",
    date: new Date("2026-05-25T16:45:00"),
    status: "success",
  },
  {
    id: "run-6",
    title: "Background replacement",
    date: new Date("2026-05-24T08:30:00"),
    status: "success",
  },
  {
    id: "run-7",
    title: "Batch color correction",
    date: new Date("2026-05-23T13:20:00"),
    status: "success",
  },
  {
    id: "run-8",
    title: "Image compression",
    date: new Date("2026-05-22T10:00:00"),
    status: "failed",
  },
  {
    id: "run-9",
    title: "Format conversion",
    date: new Date("2026-05-21T15:10:00"),
    status: "success",
  },
  {
    id: "run-10",
    title: "Metadata cleanup",
    date: new Date("2026-05-20T09:45:00"),
    status: "running",
  },
];
