import MiddlewareFactory from '@decorators/MiddlewareFactory.decorator'
import UpgradeRequiredException from '@exceptions/UpgradeRequiredException'
import { UpgradeRequiredRequest } from '@framework/types/UpgradeRequiredRequest'
import { NextFunction, Request, Response } from 'express'
import { Duplex } from 'stream'

@MiddlewareFactory('ChannelMiddleware')
export default class ChannelMiddleware {
  public error = new UpgradeRequiredException()

  /**
   * Handles the "passes" method.
   *
   * @param {Request} req - The Request object.
   * @param {Response} res - The Response object.
   * @param {NextFunction} next - The NextFunction object.
   * @return {void}
   */
  public passes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | NextFunction {
    if (req.headers && req.headers.upgrade !== 'websocket') {
      return this.upgradeRequired(res)
    }
    req['upgrade'] = {
      request: req,
      socket: res.socket as Duplex,
      head: Buffer.alloc(0),
    } as UpgradeRequiredRequest
    next()
  }

  /**
   * Returns an unauthenticated response
   * @param res
   */
  public upgradeRequired(res: Response): Response {
    this.error.report()
    return res.status(this.error.code).json({
      message: this.error.message,
    })
  }
}
