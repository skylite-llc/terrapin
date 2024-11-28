import MiddlewareFactory from '@decorators/MiddlewareFactory.decorator'
import UnauthenticatedException from '@exceptions/UnauthenticatedException'
import { NextFunction, Request, Response } from 'express'

@MiddlewareFactory('AuthenticatedMiddleware')
export default class AuthenticatedMiddleware {
  public error = new UnauthenticatedException()

  /**
   * Checks if AuthenticatedMiddleware passes
   */
  public async passes(req: Request, res: Response, next: NextFunction) {
    try {
      // Your authentication code here
      return next()
    } catch (error) {
      this.returnUnauthenticated(res)
    }
  }

  /**
   * Returns an unauthenticated response
   * @param res
   */
  public returnUnauthenticated(res: Response): Response {
    this.error.report()
    return res.status(this.error.code).json({
      message: this.error.message,
    })
  }
}
