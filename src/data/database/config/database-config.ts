import { PluralizedNamingStrategy } from './PluralizedNamingStrategy'
import {
  DatabaseConfig,
  DatabaseOptions,
} from '@framework/types/DatabaseConfig'
import { findRootDirectory } from '@helpers'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import dotenv from 'dotenv'
import * as process from 'node:process'
import path from 'path'

const rootDir = findRootDirectory(path.resolve('./'))
dotenv.config({ path: path.join(rootDir, '.env') })

export const databasesConfig: DatabaseConfig[] = [
  {
    type: DatabaseOptions.postgres,
    options: {
      driver: PostgreSqlDriver,
      namingStrategy: PluralizedNamingStrategy,
      entities: [`${rootDir}/src/**/*.entity.ts`],
      dbName: process.env.POSTGRES_DB || 'terrapin',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      migrations: {
        path: `${rootDir}/src/data/database/migrations`,
      },
    },
  },
  // {
  //    type: DatabaseOptions.postgres,
  //    options: {
  //        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  //        dbName: process.env.POSTGRES_DB || 'database',
  //        host: process.env.POSTGRES_HOST || 'localhost',
  //        port: parseInt(process.env.POSTGRES_PORT || '5432'),
  //        user: process.env.POSTGRES_USER || 'user',
  //        password: process.env.POSTGRES_PASSWORD || 'password',
  //        entitiesTs: [__dirname + '/../**/*.entity.ts'],
  //    },
  // },
  // {
  //    type: DatabaseOptions.mysql,
  //    options: {
  //        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  //        dbName: process.env.MYSQL_DB || 'database',
  //        host: process.env.MYSQL_HOST || 'localhost',
  //        port: parseInt(process.env.MYSQL_PORT || '3306'),
  //        user: process.env.MYSQL_USER || 'user',
  //        password: process.env.MYSQL_PASSWORD || 'password',
  //        entitiesTs: [__dirname + '/../**/*.entity.ts'],
  //    },
  //  },
  // {
  //    type: DatabaseOptions.mongodb,
  //    options: {
  //        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  //        clientUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/database',
  //        entitiesTs: [__dirname + '/../**/*.entity.ts'],
  //    },
  // },
]

export default databasesConfig
