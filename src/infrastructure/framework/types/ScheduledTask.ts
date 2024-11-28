import { QueueMessageIds } from '../../queue/QueueMessageIds'

export type ScheduledTask = {
  key: string
  frequency: string
  queue:
    | QueueMessageIds.LONG_QUEUE
    | QueueMessageIds.SHORT_QUEUE
    | QueueMessageIds.QUEUE_FAILURE
}
