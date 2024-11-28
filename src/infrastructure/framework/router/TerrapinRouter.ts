import 'reflect-metadata'
import { controllers } from '@controllers/index'
import { MetadataKeys } from '@decorators/metadata.keys'
import { IRouter } from '@decorators/MethodDecoratorFactory.decorator'
import { IMiddleware } from '@decorators/UseMiddlewareFactory.decorator'
import { middleware } from '@middlewares/index'
import PolicyMiddleware from '@middlewares/PolicyMiddleware'
import ValidationMiddleware from '@middlewares/ValidationMiddleware'
import express, { Application as ExApplication, Handler } from 'express'
import { Container } from 'typedi'

export class TerrapinRouter {
  /**
   * registerRouters
   * @inner
   */
  public static registerRouters(instance: ExApplication) {
    const routes: object[] = []
    // iterate the controllers loaded by the application
    controllers.forEach(controllerClass => {
      // fetch the controller instance from the IOC
      const controllerInstance: { [handleName: string]: Handler } =
        Container.get(controllerClass as never)
      // extract the base path of the controller class
      const basePath: string = Reflect.getMetadata(
        MetadataKeys.BASE_PATH,
        controllerClass as object,
      ) as string
      // extract a list of routers included in the application
      const routers: IRouter[] = Reflect.getMetadata(
        MetadataKeys.ROUTERS,
        controllerClass as object,
      ) as IRouter[]
      // extract a list of middlewares included in the application
      const middlewares: IMiddleware[] =
        (Reflect.getMetadata(
          MetadataKeys.MIDDLEWARE,
          controllerClass as object,
        ) as IMiddleware[]) ?? []
      // extract a list of request validators included in the application
      const requests: IMiddleware[] =
        (Reflect.getMetadata(
          MetadataKeys.REQUESTS,
          controllerClass as object,
        ) as IMiddleware[]) ?? []
      // extract a list of policies included in the application
      const policies: IMiddleware[] =
        (Reflect.getMetadata(
          MetadataKeys.POLICIES,
          controllerClass as object,
        ) as IMiddleware[]) ?? []
      // instantiate the main router
      const exRouter = express.Router()
      // iterate the application routers
      routers.forEach(({ method, path, handlerName }) => {
        const applyMiddleware: never[] = []
        // extract middleware where the handler matches the handlerName
        const routeMiddleware = middlewares.filter(
          middleware => middleware.handler === handlerName,
        )
        // extract request validators where the handler matches the
        // handlerName
        const routeRequests = requests.filter(
          request => request.handler === handlerName,
        )
        // extract policies where the handler matches the handlerName
        const routePolicies = policies.filter(
          policy => policy.handler === handlerName,
        )
        if (routeMiddleware?.length > 0) {
          // apply middlewares discovered
          for (const mid of routeMiddleware) {
            const middlewareClass = middleware.find(
              middleware => middleware['name'] === mid.middleware,
            )
            // instantiate the middleware class
            const middlewareInstance: { [handleName: string]: Handler } =
              new middlewareClass() as never
            // bind the middlewares' `passes` method to the route
            applyMiddleware.push(
              middlewareInstance[String('passes')].bind(
                middlewareInstance as never,
              ) as never,
            )
          }
        }
        if (routePolicies?.length > 0) {
          // apply policies discovered
          for (const routePolicy of routePolicies) {
            const policyClass: { [handleName: string]: Handler } =
              middleware.find(
                middleware => middleware.name === routePolicy.middleware,
              ) as never
            // instantiate the policy middleware class
            const policyMiddleware: { [handleName: string]: Handler } =
              new PolicyMiddleware() as never

            const apply = policyMiddleware[String('passes')].bind(
              policyMiddleware as never,
            )(policyClass[String('passes')] as never) as never
            applyMiddleware.push(apply)
          }
        }
        if (routeRequests?.length > 0) {
          for (const routeRequest of routeRequests) {
            // apply request validators discovered
            const requestClass: { [handleName: string]: Handler } =
              middleware.find(
                middleware => middleware.name === routeRequest.middleware,
              ) as never
            // instantiate the request validator
            const validationMiddleware: { [handleName: string]: Handler } =
              new ValidationMiddleware() as never

            const apply = validationMiddleware[String('passes')].bind(
              validationMiddleware as never,
            )(requestClass[String('schema')] as never) as never
            applyMiddleware.push(apply)
          }
        }
        routes.push({
          method: method.toLocaleUpperCase(),
          api: `${basePath + path}`,
          controller: `${controllerClass.name}.${String(handlerName)}`,
        })
        exRouter[method](
          path,
          applyMiddleware,
          controllerInstance[String(handlerName)].bind(
            controllerInstance as never,
          ) as never,
        )
      })
      instance.use(basePath, exRouter)
    })
    return routes
  }
}
