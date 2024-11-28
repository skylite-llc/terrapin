import { QueueMessageIds } from './QueueMessageIds'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import Log from '@logger/Log'
import process from 'process'
import * as uuid from 'uuid'

export default class SQSPublisher {
  private sqsClient: SQSClient
  private readonly deadLetterQueueUrl: string
  private readonly queueUrl: string

  /**
   * @constructs SqsPublisher
   */
  protected constructor() {}

  /**
   * Publish to queue
   * @param message_body
   * @param message_group_id
   */
  async sendMessage(message_body: string, message_group_id: string) {}

  /**
   * Publishes a failed message to the dead letter queue
   * @param message_body
   */
  async recordFailure(message_body: string) {}
}
