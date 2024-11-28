import { MetadataKeys } from './metadata.keys'

export enum Methods {
  Middleware = 'middleware',
  Request = 'request',
  Policy = 'policy',
}

/**
 * @interface IMiddleware
 */
export interface IMiddleware {
  handler: string | symbol
  middleware: string
}

/**
 * UseMiddlewareFactoryDecorator
 */
const useMiddlewareFactoryDecorator = (method: Methods) => {
  switch (method) {
    case Methods.Middleware:
      return (middleware: string) => {
        return (target: object, propertyKey: string | symbol) => {
          const controllerClass = target.constructor
          const middlewares: IMiddleware[] = (Reflect.hasMetadata(
            MetadataKeys.MIDDLEWARE,
            controllerClass,
          ) as never)
            ? (Reflect.getMetadata(
                MetadataKeys.MIDDLEWARE,
                controllerClass,
              ) as never)
            : []
          middlewares.push({
            handler: propertyKey,
            middleware: middleware,
          })
          Reflect.defineMetadata(
            MetadataKeys.MIDDLEWARE,
            middlewares,
            controllerClass,
          )
        }
      }
    case Methods.Request:
      return (request: string) => {
        return (target: object, propertyKey: string | symbol) => {
          const controllerClass = target.constructor
          const requests: IMiddleware[] = (Reflect.hasMetadata(
            MetadataKeys.REQUESTS,
            controllerClass,
          ) as never)
            ? (Reflect.getMetadata(
                MetadataKeys.REQUESTS,
                controllerClass,
              ) as never)
            : []
          requests.push({
            handler: propertyKey,
            middleware: request,
          })
          Reflect.defineMetadata(
            MetadataKeys.REQUESTS,
            requests,
            controllerClass,
          )
        }
      }
    case Methods.Policy:
      return (request: string) => {
        return (target: object, propertyKey: string | symbol) => {
          const controllerClass = target.constructor
          const requests: IMiddleware[] = (Reflect.hasMetadata(
            MetadataKeys.POLICIES,
            controllerClass,
          ) as never)
            ? (Reflect.getMetadata(
                MetadataKeys.POLICIES,
                controllerClass,
              ) as never)
            : []
          requests.push({
            handler: propertyKey,
            middleware: request,
          })
          Reflect.defineMetadata(
            MetadataKeys.POLICIES,
            requests,
            controllerClass,
          )
        }
      }
  }
}

export const UseMiddleware = useMiddlewareFactoryDecorator(Methods.Middleware)
export const UseRequest = useMiddlewareFactoryDecorator(Methods.Request)
export const UsePolicy = useMiddlewareFactoryDecorator(Methods.Policy)
