import { describe, it, expect } from "vitest";
import { jobQueue } from "../src/services/queue.service";

describe("Async Job Queue Engine", () => {
  it("should register handlers, enqueue background jobs, and process them", async () => {
    let handlerExecuted = false;

    jobQueue.registerHandler("TEST_ASYNC_JOB", async (job) => {
      handlerExecuted = true;
      return { echoed: job.data.testValue };
    });

    const job = await jobQueue.add("TEST_ASYNC_JOB", { testValue: "EduReach2026" });
    expect(job).toBeDefined();
    expect(job.status).toMatch(/queued|processing|completed/);

    // Give the async event loop a tick to process
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handlerExecuted).toBe(true);
    expect(job.status).toBe("completed");
    expect(job.completedAt).toBeDefined();
  });
});
