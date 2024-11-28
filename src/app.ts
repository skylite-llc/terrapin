import { TerrapinRouter } from '@framework/router/TerrapinRouter'
import SQSConsumer from '@queue/SqsConsumer'
import Scheduler from '@scheduler/Scheduler'
import express, { Application as ExApplication } from 'express'
import process from 'process'

class App {
  private readonly _instance: ExApplication
  public routes: object[]

  /**
   * get instance
   */
  get instance(): ExApplication {
    return this._instance
  }

  /**
   * @property _instance {ExApplication} Express Application
   * @constructs App
   */
  constructor() {
    this._instance = express()
    this._instance.use(express.json())
    this.routes = TerrapinRouter.registerRouters(this._instance)
    if (process.env.APP_ENV === 'local') this.startScheduler()
    if (process.env.APP_ENV === 'local') this.startConsumer()
  }

  /**
   * Start the consumer, for local development only
   * @private
   */
  private startConsumer() {
    const consumer = new SQSConsumer()
    consumer.start()
  }

  private startScheduler() {
    const scheduler = new Scheduler()
    scheduler.start()
  }
}

export default new App()
