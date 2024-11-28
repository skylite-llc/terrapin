import MiddlewareFactory from '@decorators/MiddlewareFactory.decorator'
import UnauthorizedException from '@exceptions/UnauthorizedException'
import { NextFunction, Request, Response } from 'express'

@MiddlewareFactory('PolicyMiddleware')
export default class PolicyMiddleware {
  public error = new UnauthorizedException()

  /**
   * Checks if PolicyMiddleware passes
   */
  public passes(
    policy: (req: Request, res: Response, next: NextFunction) => unknown,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await policy(req, res, next)
      } catch (e: unknown) {
        return res.status(<number>e['code'] ?? this.error.code).json({
          message: e['message'] ?? this.error.message,
        })
      }
    }
  }
}
