import { MetadataKeys } from './metadata.keys'

/**
 * MiddlewareFactory
 * @param name
 * @constructor
 * @constructs MiddlewareFactory
 */
const MiddlewareFactory = (name: string): ClassDecorator => {
  return target => {
    Reflect.defineMetadata(MetadataKeys.BASE_PATH, name, target)
  }
}

export default MiddlewareFactory
