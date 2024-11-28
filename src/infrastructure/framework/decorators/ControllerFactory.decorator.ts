import { MetadataKeys } from './metadata.keys'

/**
 * ControllerFactory
 * @param basePath
 * @constructor
 * @constructs ControllerFactory
 */
const ControllerFactory = (basePath: string): ClassDecorator => {
  return target => {
    Reflect.defineMetadata(MetadataKeys.BASE_PATH, basePath, target)
  }
}

export default ControllerFactory
