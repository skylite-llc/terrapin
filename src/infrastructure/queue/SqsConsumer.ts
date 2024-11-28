import WorkerManager from './WorkerManager'
import { SQSClient, Message } from '@aws-sdk/client-sqs'
import path from 'path'
import process from 'process'

const extension = process.env.APP_ENV === 'local' ? 'ts' : 'js'
const basePath = process.env.APP_ENV === 'local' ? 'src' : 'dist'

export default class SQSConsumer {
  private sqsClient: SQSClient
  private readonly queueUrl: string
  private readonly maxRetries: number
  private isWorkerAvailableListenerActive: boolean = false
  private readonly jobsPath: string = path.resolve(
    path.basename(basePath),
    'jobs',
  )
  public jobs: { [key: string]: string } = {}
  public workerManager: WorkerManager

  /**
   * @constructs SqsConsumer
   * @param maxRetries
   */
  protected constructor(maxRetries: number = 3) {}

  /**
   * Starts consuming messages from application boot
   */
  public async start() {}

  /**
   * Consume messages from SQS
   */
  public async consumeMessagesIfWorkersAvailable() {}

  /**
   * Listens for a worker to become available
   */
  public addWorkerAvailableListener() {}

  /**
   * Removes the worker listener
   */
  public removeWorkerAvailableListener() {}

  /**
   * When a worker is avaialble, continue consuming SQS
   */
  public onWorkerAvailable = async () => {}

  /**
   * Receive a message from AWS SQS
   * @private
   */
  public async receiveMessages() {}

  /**
   * Process job
   * @param jobPath
   * @param data
   * @param receiptHandle
   */
  public async processJob(
    jobPath: string,
    data: object,
    receiptHandle: string,
  ) {}

  /**
   * Process a message using worker pool
   * Todo Centralize job mapping to Queue IDs
   * @param message
   * @private
   */
  public async processMessage(message: Message) {}

  /**
   * Remove a message from the queue
   * @param receiptHandle
   * @private
   */
  public async deleteMessage(receiptHandle: string) {}
}
