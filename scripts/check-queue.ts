import "dotenv/config";
import { Queue } from "bullmq";

async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("REDIS_URL niet gezet");
    process.exit(1);
  }

  console.log("Connecting to Redis...");
  const q = new Queue("scans", { connection: { url: redisUrl } });

  const waiting = await q.getWaiting();
  const active = await q.getActive();
  const failed = await q.getFailed();
  const completed = await q.getCompleted();

  console.log("\n--- Queue Status ---");
  console.log("Waiting:", waiting.length);
  console.log("Active:", active.length);
  console.log("Failed:", failed.length);
  console.log("Completed:", completed.length);

  if (failed.length > 0) {
    console.log("\n--- Failed Jobs ---");
    for (const job of failed.slice(0, 3)) {
      console.log(`Job ${job.id}:`, job.failedReason);
      console.log("Data:", JSON.stringify(job.data, null, 2));
      console.log("---");
    }
  }

  if (waiting.length > 0) {
    console.log("\n--- Waiting Jobs ---");
    for (const job of waiting.slice(0, 5)) {
      console.log(`Job ${job.id}:`, JSON.stringify(job.data));
    }
  }

  if (active.length > 0) {
    console.log("\n--- Active Jobs ---");
    for (const job of active.slice(0, 5)) {
      console.log(`Job ${job.id}:`, JSON.stringify(job.data));
    }
  }

  await q.close();
}

main().catch(console.error);
