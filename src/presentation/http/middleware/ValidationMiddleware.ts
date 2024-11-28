import MiddlewareFactory from '@decorators/MiddlewareFactory.decorator'
import { NextFunction, Request, Response } from 'express'
import process from 'process'
import { AnyZodObject, ZodError } from 'zod'

@MiddlewareFactory('ValidationMiddleware')
export default class ValidationMiddleware {
  /**
   * Checks if Validation passes
   * @param schema {AnyZodObject} The schema to validate against can include
   * a body, query or params
   */
  public passes(schema: AnyZodObject) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const elementsToValidate: Partial<
          Record<'params' | 'query' | 'body', unknown>
        > = {}
        if (Object.keys(req.params).length > 0) {
          elementsToValidate.params = req.params
        }
        if (Object.keys(req.query).length > 0) {
          elementsToValidate.query = req.query
        }
        if (req.body && Object.keys(req.body).length > 0) {
          elementsToValidate.body = req.body
        }
        schema.parse(elementsToValidate)
        next()
      } catch (e: unknown) {
        if (e instanceof ZodError) {
          return res.status(422).json({
            errors: e.issues,
          })
        }
        return res.status(500).json({
          message: process.env.GENERAL_ERROR_MESSAGE ?? 'An error occurred',
        })
      }
    }
  }
}
