import ServerError from '@exceptions/ServerErrorException'
import { Response } from 'express'
import process from 'node:process'

export default abstract class BaseApiController {
  /**
   * @constructs BaseApiController
   * @protected
   */
  protected constructor() {}

  /**
   * Respond with an error code of 500
   * @param res {Response} The response
   * @param e {Error} an error to throw
   */
  public errorResponse(res: Response, e: Error): Response {
    const serverError = new ServerError()
    return res.status(Number(e['code'] ?? serverError.code)).json({
      message: e['message'] ?? serverError.message,
      data: e['data'] ?? undefined,
      debug: process.env.APP_ENV === 'production' ? undefined : e.toString(),
    })
  }
}
