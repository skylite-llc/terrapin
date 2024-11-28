import { JobData } from './JobData'
import { BaseDirectory } from '@helpers'
import { EventEmitter } from 'events'
import path from 'path'
import process from 'process'
import { Worker } from 'worker_threads'

export type WorkerState = {
  worker: Worker
  isBusy: boolean
}

// todo figure out a better way to do this
const extension = process.env.APP_ENV === 'local' ? 'ts' : 'js'

/**
 * WorkerManager
 *
 * The WorkerManager delegates queue messages to the various workers per
 * environment.  As messages are successfully consumed by workers, they are
 * removed from the queue.
 *
 * This file should not need to be altered unless adjustments are being made
 * to the actual management logic.  For new jobs, create a new job in the
 * jobs directory and add the mapping to the consumer.
 *
 * Jobs are cleared from the queue when the execution begins and the worker
 * successfully boots.  Job failures are published to a
 * dead-letter-queue, including a replica of the data, the job execution
 * path, and the original message receipt handle.
 */
export default class WorkerManager extends EventEmitter {
  private workers: WorkerState[]
  private readonly maxWorkers: number = 12

  /**
   * @constructs WorkerManager
   */
  constructor() {
    super()
    this.workers = []
    this.initializeWorkers()
  }

  /**
   * Notifies when a worker comes online
   */
  public notifyWorkerAvailable() {
    // event emitter for available workers.  communicates directly with the
    // SQSConsumer to signal availability.  on availability, sqs consumers
    // continues consuming the queue
    this.emit('workerAvailable')
  }

  /**
   * Checks if there is at least one worker available
   */
  public isWorkerAvailable(): boolean {
    // determines if any workers are available
    return this.workers.some(workerState => !workerState.isBusy)
  }

  /**
   * Execute a job on an active worker
   * @param jobData
   */
  public executeJob(jobData: JobData): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const availableWorkerState = this.findAvailableWorker()
      if (availableWorkerState) {
        const { worker } = availableWorkerState
        availableWorkerState.isBusy = true
        const msgHandler = result => {
          if (result?.error)
            return this.handleWorkerError(jobData, result.error, worker)
          availableWorkerState.isBusy = false
          this.notifyWorkerAvailable()
          worker.removeListener('error', errHandler)
          worker.removeListener('message', msgHandler)
        }
        const errHandler = async err => {
          await this.handleWorkerError(jobData, err, worker)
          worker.removeListener('error', errHandler)
          worker.removeListener('message', msgHandler)
        }
        worker.on('message', msgHandler)
        worker.on('error', errHandler)
        worker.postMessage(jobData)
        resolve(true)
      } else {
        reject(1)
      }
    })
  }

  /**
   * Boots a worker file for the application context
   * @private
   */
  private bootWorkerFile(): Worker {
    // ts extension requires a JS bootstrap for local development
    if (extension === 'ts')
      // registered bootstrap file for ts-node usage in typescript
      return new Worker(path.resolve(BaseDirectory, './workerBootstrap.js'), {
        workerData: {
          workerPath: `./Worker.${extension}`,
        },
      })
    // return the main js worker for non-local application
    return new Worker(path.resolve(BaseDirectory, `./Worker.${extension}`))
  }

  /**
   * Handle a worker error
   * @param jobData
   * @param err
   * @param worker
   * @private
   */
  private async handleWorkerError(jobData, err, worker) {
    if (
      jobData.attempts &&
      jobData.attempts < (process.env.JOB_ATTEMPTS ?? 3)
    ) {
      return this.executeJob({
        ...jobData,
        attempts: jobData.attempts + 1,
      }).catch(() => true)
    } else {
      worker.isBusy = false
      this.notifyWorkerAvailable()
    }
  }

  /**
   * Registers worker thread handles with the os
   * @private
   */
  private initializeWorkers(): void {
    // initialize the max worker threads for processing background tasks
    for (let i = 0; i < this.maxWorkers; i++) {
      // workers boot the same worker file and run a job inside the booted
      // worker
      const worker = this.bootWorkerFile()
      this.workers.push({ worker, isBusy: false })
    }
  }

  /**
   * Finds an available worker
   * @private
   */
  private findAvailableWorker(): WorkerState | null {
    // returns the first available worker that is not running a job
    return this.workers.find(workerState => !workerState.isBusy) || null
  }
}
