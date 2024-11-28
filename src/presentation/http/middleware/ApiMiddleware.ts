import { ACCEPTED_ACCEPT_HEADERS, ACCEPTED_CONTENT_TYPE_HEADERS } from '@config'
import MiddlewareFactory from '@decorators/MiddlewareFactory.decorator'
import BadRequestException from '@exceptions/BadRequestException'
import UnsupportedMediaTypeException from '@exceptions/UnsupportedMediaTypeException'
import { NextFunction, Request, Response } from 'express'

@MiddlewareFactory('ApiMiddleware')
export default class ApiMiddleware {
  public unsupportedMediaTypeException = new UnsupportedMediaTypeException()
  public badRequestException = new BadRequestException()

  /**
   * Checks if ApiMiddleware passes
   */
  public async passes(req: Request, res: Response, next: NextFunction) {
    if (!ACCEPTED_CONTENT_TYPE_HEADERS.includes(req.headers['content-type']))
      return res.status(this.unsupportedMediaTypeException.code).json({
        message: this.unsupportedMediaTypeException.message,
      })
    if (!ACCEPTED_ACCEPT_HEADERS.includes(req.headers['accept']))
      return res.status(this.badRequestException.code).json({
        message: this.badRequestException.message,
      })

    return next()
  }
}
