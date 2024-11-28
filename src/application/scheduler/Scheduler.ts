import '@config'
import { tasks } from './tasks'
import SQSPublisher from '../queue/SqsPublisher'
import Log from '@logger/Log'
import chalk from 'chalk'
import cron from 'node-cron'

export default class Scheduler {
  static log = msg => Log.logger(chalk.bold.bgBlue(chalk.white(`${msg}`)))
  public publisher: SQSPublisher

  /**
   * @constructs Scheduler
   */
  public constructor() {
    this.publisher = new SQSPublisher()
  }

  /**
   * Starts the scheduler
   * Concurrency handled per instance on ECS
   */
  public async start(): Promise<void> {
    for (const task of tasks) {
      cron.schedule(task.frequency, async () => {
        try {
          await this.publisher.sendMessage(
            JSON.stringify({ key: task.key }),
            task.queue,
          )
        } catch (error) {
          Log.error(error)
        }
      })
    }
    Scheduler.log(`Scheduled ${tasks.length} tasks`)
  }
}
