import { UnderscoreNamingStrategy, NamingStrategy } from '@mikro-orm/core'
import pluralize from 'pluralize'

function toSnakeCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

export class PluralizedNamingStrategy
  extends UnderscoreNamingStrategy
  implements NamingStrategy
{
  classToTableName(entityName: string): string {
    return pluralize(super.classToTableName(entityName))
  }
  joinTableName(
    sourceEntity: string,
    targetEntity: string,
    propertyName: string,
  ): string {
    return pluralize(
      super.joinTableName(sourceEntity, targetEntity, propertyName),
    )
  }
  joinColumnName(propertyName: string): string {
    return `${pluralize.singular(propertyName)}`
  }
  joinKeyColumnName(
    entityName: string,
    referencedColumnName: string = 'id',
  ): string {
    const singularEntityName = pluralize.singular(entityName)
    return `${toSnakeCase(singularEntityName)}_${referencedColumnName}`
  }
}
