import { Queue } from "bullmq";

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : undefined;

export const scanQueue = connection
  ? new Queue("scans", { connection })
  : null;

export interface ScanJobData {
  scanId: string;
  websiteId: string;
  url: string;
  maxPages: number;
  startedById?: string;
}

export interface QuickScanJobData {
  quickScanId: string;
  url: string;
}

export async function addScanJob(data: ScanJobData) {
  if (!scanQueue) {
    throw new Error("Redis is not configured. Cannot queue scan jobs.");
  }

  return scanQueue.add("scan", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

export async function addQuickScanJob(data: QuickScanJobData) {
  if (!scanQueue) {
    throw new Error("Redis is not configured. Cannot queue scan jobs.");
  }

  return scanQueue.add("quick-scan", data, {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: 200,
    removeOnFail: 100,
    priority: 1, // Quick scans get higher priority
  });
}
