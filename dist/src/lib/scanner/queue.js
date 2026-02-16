"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanQueue = void 0;
exports.addScanJob = addScanJob;
exports.addQuickScanJob = addQuickScanJob;
const bullmq_1 = require("bullmq");
const connection = process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : undefined;
exports.scanQueue = connection
    ? new bullmq_1.Queue("scans", { connection })
    : null;
async function addScanJob(data) {
    if (!exports.scanQueue) {
        throw new Error("Redis is not configured. Cannot queue scan jobs.");
    }
    return exports.scanQueue.add("scan", data, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
    });
}
async function addQuickScanJob(data) {
    if (!exports.scanQueue) {
        throw new Error("Redis is not configured. Cannot queue scan jobs.");
    }
    return exports.scanQueue.add("quick-scan", data, {
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
