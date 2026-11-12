export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  error?: string;
}

type JobHandler<T = any> = (job: Job<T>) => Promise<any>;

class AsyncJobQueue {
  private queue: Job[] = [];
  private handlers = new Map<string, JobHandler>();
  private isProcessing = false;

  public registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  public async add<T = any>(type: string, data: T): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      data,
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    this.queue.push(job);
    console.log(`📥 [Job Queue] Enqueued job ${job.id} (${type})`);
    this.processNext();
    return job;
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    const job = this.queue.find((j) => j.status === "queued");
    if (!job) return;

    this.isProcessing = true;
    job.status = "processing";

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = "failed";
      job.error = `No handler registered for job type: ${job.type}`;
      this.isProcessing = false;
      this.processNext();
      return;
    }

    try {
      console.log(`⚙️  [Job Queue] Processing job ${job.id} (${job.type})...`);
      await handler(job);
      job.status = "completed";
      job.completedAt = new Date().toISOString();
      console.log(`✅ [Job Queue] Completed job ${job.id} (${job.type})`);
    } catch (err: any) {
      job.status = "failed";
      job.error = err.message || "Unknown error";
      console.error(`❌ [Job Queue] Failed job ${job.id}:`, err);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }

  public getJob(id: string): Job | undefined {
    return this.queue.find((j) => j.id === id);
  }

  public getStats() {
    return {
      total: this.queue.length,
      queued: this.queue.filter((j) => j.status === "queued").length,
      completed: this.queue.filter((j) => j.status === "completed").length,
      failed: this.queue.filter((j) => j.status === "failed").length,
    };
  }
}

export const jobQueue = new AsyncJobQueue();

// Register background handlers
jobQueue.registerHandler("AUDIT_ADMISSION_APPLICATION", async (job) => {
  // Simulate automated document and score background audit
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { audited: true, verifiedAt: new Date().toISOString() };
});

jobQueue.registerHandler("GENERATE_STUDENT_REPORT_CARD", async (job) => {
  // Simulate background report card compilation
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { compiled: true, rollNo: job.data.rollNo };
});
