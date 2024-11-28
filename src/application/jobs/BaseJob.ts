import '../config'
import '../auth/firebase'
import { QueueMessageIds } from '../queue/QueueMessageIds'
import SQSPublisher from '../queue/SqsPublisher'
import Log from '@logger/Log'
import { parentPort } from 'node:worker_threads'
import process from 'process'
import { Service } from 'typedi'
import { z } from 'zod'

@Service()
export default abstract class BaseJob {
  public sqsPublisher: SQSPublisher
  public taskId: string

  /**
   * @constructs BaseJob
   */
  public constructor() {
    this.sqsPublisher = new SQSPublisher()
  }

  /**
   * Dispatches the job to the SQS Publisher.
   * @param data {string} Serialized data (JSON string event payload)
   * @param queue {QueueMessageIds} The queue to dispatch on, defaults to short
   */
  private async dispatch(data: object, queue?: QueueMessageIds) {
    try {
      const key = this.constructor.name
      await this.sqsPublisher.sendMessage(
        JSON.stringify({
          key,
          data,
        }),
        queue ?? QueueMessageIds.SHORT_QUEUE,
      )
    } catch (error) {
      throw error
    }
  }

  /**
   * Dispatches the job
   * @param eventData {string} event Data
   * @param queue {QueueMessageIds} optional queue
   * @returns {Promise<this>} Instantiated job
   * Instantiates the type extending BaseJerb as a new class
   * and returning a non-singleton
   */
  public static async dispatch<T extends BaseJob>(
    this: { new (): T; getSchema: () => z.ZodType<unknown, unknown> },
    eventData: object,
    queue?: QueueMessageIds,
  ): Promise<T> {
    try {
      const jobInstance = new this()
      const schema = this.getSchema()
      if (schema) schema.parse(eventData)
      await jobInstance.dispatch(eventData, queue)
      return jobInstance
    } catch (e) {
      Log.error(this.constructor.name + ' received invalid payload')
      Log.error(e)
      throw e
    }
  }

  /**
   * Runs the job
   */
  public async run() {}

  /**
   * Exits successfully
   * @param taskId
   * @param code
   */
  public async exit(taskId: string, code?: number) {
    if (parentPort) parentPort.postMessage(code)
    await this.release(taskId)
  }

  /**
   * Fails the job
   * @param taskId
   * @param message
   */
  public async fail(taskId: string, message?: string) {
    await this.release(taskId)
    await this.sqsPublisher.recordFailure(message ?? '')
    if (parentPort) parentPort.postMessage({ error: message ?? '' })
  }

  /**
   * Releases the job lock
   */
  public async release(taskId: string) {
    // todo release jerb
  }

  /**
   * Gets the schema for the job payload
   * @protected
   */
  protected static getSchema(): z.ZodType<unknown, unknown> {
    throw new Error('Schema method not implemented')
  }
}
