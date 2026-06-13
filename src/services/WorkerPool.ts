import type { WorkerRequest, WorkerResponse } from '../models/Invoice';
import { toUserErrorMessage } from '../utils/errors';
import { createId } from '../utils/formatters';

interface PoolTask {
  id: string;
  file: File;
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
}

interface PoolWorker {
  worker: Worker;
  busy: boolean;
}

export interface WorkerPoolOptions {
  concurrency?: number;
  batchSize?: number;
  onBatchStart?: (batchIndex: number, batchSize: number) => void;
}

/**
 * Pool de Web Workers con cola y procesamiento por lotes.
 */
export class WorkerPool {
  private readonly workers: PoolWorker[] = [];
  private readonly queue: PoolTask[] = [];
  private readonly batchSize: number;
  private readonly onBatchStart: ((batchIndex: number, batchSize: number) => void) | undefined;
  private activeTasks = 0;
  private disposed = false;

  constructor(options: WorkerPoolOptions = {}) {
    const concurrency = options.concurrency ?? Math.max(1, navigator.hardwareConcurrency || 4);
    this.batchSize = options.batchSize ?? 50;
    this.onBatchStart = options.onBatchStart;

    for (let i = 0; i < concurrency; i++) {
      const worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), {
        type: 'module',
      });
      this.workers.push({ worker, busy: false });
    }
  }

  /**
   * Procesa una lista de archivos PDF en lotes usando workers concurrentes.
   */
  async processFiles(
    files: File[],
    onResult: (response: WorkerResponse) => void,
  ): Promise<void> {
    for (let offset = 0; offset < files.length; offset += this.batchSize) {
      if (this.disposed) break;

      const batch = files.slice(offset, offset + this.batchSize);
      this.onBatchStart?.(Math.floor(offset / this.batchSize), batch.length);

      await Promise.all(
        batch.map(async (file) => {
          const response = await this.enqueue(file);
          onResult(response);
        }),
      );
    }
  }

  /**
   * Encola un archivo y espera su resultado.
   */
  private enqueue(file: File): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const task: PoolTask = {
        id: createId('task'),
        file,
        resolve,
        reject,
      };
      this.queue.push(task);
      this.dispatch();
    });
  }

  private dispatch(): void {
    if (this.disposed) return;

    for (const poolWorker of this.workers) {
      if (poolWorker.busy) continue;

      const task = this.queue.shift();
      if (!task) return;

      poolWorker.busy = true;
      this.activeTasks++;
      this.runTask(poolWorker, task);
    }
  }

  private runTask(poolWorker: PoolWorker, task: PoolTask): void {
    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== task.id) return;

      poolWorker.worker.removeEventListener('message', handleMessage);
      poolWorker.worker.removeEventListener('error', handleError);
      poolWorker.busy = false;
      this.activeTasks--;
      task.resolve(event.data);
      this.dispatch();
    };

    const handleError = (event: ErrorEvent) => {
      poolWorker.worker.removeEventListener('message', handleMessage);
      poolWorker.worker.removeEventListener('error', handleError);
      poolWorker.busy = false;
      this.activeTasks--;
      task.resolve({
        type: 'error',
        id: task.id,
        fileName: task.file.name,
        error: toUserErrorMessage(event.message || 'Error en worker', 'pdf'),
      });
      this.dispatch();
    };

    poolWorker.worker.addEventListener('message', handleMessage);
    poolWorker.worker.addEventListener('error', handleError);

    void task.file.arrayBuffer().then((buffer) => {
      const request: WorkerRequest = {
        type: 'process',
        id: task.id,
        fileName: task.file.name,
        buffer,
      };
      poolWorker.worker.postMessage(request, [buffer]);
    }).catch((error: unknown) => {
      poolWorker.worker.removeEventListener('message', handleMessage);
      poolWorker.worker.removeEventListener('error', handleError);
      poolWorker.busy = false;
      this.activeTasks--;
      task.resolve({
        type: 'error',
        id: task.id,
        fileName: task.file.name,
        error: toUserErrorMessage(error, 'pdf'),
      });
      this.dispatch();
    });
  }

  /**
   * Libera todos los workers del pool.
   */
  dispose(): void {
    this.disposed = true;
    for (const poolWorker of this.workers) {
      poolWorker.worker.terminate();
    }
    this.workers.length = 0;
    this.queue.length = 0;
  }

  /** Número de workers activos en el pool. */
  get size(): number {
    return this.workers.length;
  }

  /** Tareas actualmente en ejecución. */
  get running(): number {
    return this.activeTasks;
  }
}
