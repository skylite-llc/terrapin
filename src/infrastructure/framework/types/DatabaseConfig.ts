import { Options } from '@mikro-orm/core'
import { MongoDriver } from '@mikro-orm/mongodb'
import { MySqlDriver } from '@mikro-orm/mysql'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

export enum DatabaseOptions {
  postgres = 'postgres',
  mysql = 'mysql',
  mongodb = 'mongodb',
}

export type PostgresConfig = {
  type: DatabaseOptions.postgres
  options: Options<PostgreSqlDriver>
}

export type MysqlConfig = {
  type: DatabaseOptions.mysql
  options: Options<MySqlDriver>
}

export type MongoConfig = {
  type: DatabaseOptions.mongodb
  options: Options<MongoDriver>
}

export type DatabaseConfig = PostgresConfig | MysqlConfig | MongoConfig
