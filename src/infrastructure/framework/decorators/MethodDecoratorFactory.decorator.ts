import { MetadataKeys } from './metadata.keys'

/**
 * @enum Methods
 */
export enum TerrapinMethods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
  OPTIONS = 'options',
}

/**
 * @interface IRouter
 */
export interface IRouter {
  method: TerrapinMethods
  path: string
  handlerName: string | symbol
}

/**
 * methodDecoratorFactory
 * @param method {Methods}
 */
const methodDecoratorFactory = (method: TerrapinMethods) => {
  return (path: string): MethodDecorator => {
    return (target, propertyKey) => {
      const controllerClass = target.constructor

      const routers: IRouter[] = (Reflect.hasMetadata(
        MetadataKeys.ROUTERS,
        controllerClass,
      ) as never)
        ? (Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass) as never)
        : []
      routers.push({
        method,
        path,
        handlerName: propertyKey,
      })

      Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass)
    }
  }
}

export const Get = methodDecoratorFactory(TerrapinMethods.GET)
export const Post = methodDecoratorFactory(TerrapinMethods.POST)
export const Put = methodDecoratorFactory(TerrapinMethods.PUT)
export const Patch = methodDecoratorFactory(TerrapinMethods.PATCH)
export const Delete = methodDecoratorFactory(TerrapinMethods.DELETE)
export const Options = methodDecoratorFactory(TerrapinMethods.OPTIONS)
