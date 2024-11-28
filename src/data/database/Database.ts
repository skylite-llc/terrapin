import { databasesConfig } from './config/database-config'
import {
  DatabaseConfig,
  DatabaseOptions,
} from '@framework/types/DatabaseConfig'
import Log from '@logger/Log'
import { MikroORM, Options } from '@mikro-orm/core'
import { Service } from 'typedi'

const TAG = 'db'

@Service()
export default class Database {
  public ormInstances: Record<DatabaseOptions, MikroORM | null>
  public dbConfig: DatabaseConfig[]

  /**
   * Constructor for initializing the class instance.
   * Creates an empty object to store ORM instances.
   *
   * @costructs Database
   */
  constructor() {
    this.ormInstances = Object.create({})
    this.dbConfig = databasesConfig
  }

  /**
   * Closes the database connection(s) for the given database type or all connections if no type is specified.
   *
   * @param {DatabaseOptions} [dbType] - The type of the database to close. If not specified, all database connections will be closed.
   * @returns {Promise<void>} A promise that resolves when the specified database connection(s) are closed.
   */
  public dbClose: (dbType?: DatabaseOptions) => Promise<void> = async (
    dbType: DatabaseOptions,
  ): Promise<void> => {
    if (dbType) {
      const orm = this.ormInstances[dbType]
      if (orm) {
        await orm.close()
        this.ormInstances[dbType] = null
        Log.info(`${TAG} dbClose: Closed ${dbType} database connection.`)
      }
    } else {
      for (const dbType of Object.keys(this.ormInstances)) {
        const orm = this.ormInstances[dbType]
        if (orm) {
          await orm.close()
          this.ormInstances[dbType] = null
          Log.info(`${TAG} dbClose: Closed ${dbType} database connection.`)
        }
      }
    }
  }

  /**
   * Establishes a connection to one or more databases based on the provided type.
   *
   * If a specific database type is provided, the function will connect to that
   * particular database using its configuration. If no database type is provided,
   * the function will connect to all databases listed in the configuration.
   *
   * @param {DatabaseOptions} [dbType] - The optional type of the database to connect to.
   *                                     If omitted, all available databases will be connected.
   * @returns {Promise<void>} - A promise that resolves once the connection(s) are established.
   *
   * @throws {Error} - Throws an error if the specified database type has no configuration.
   */
  public dbConnect: (dbType?: DatabaseOptions) => Promise<void> = async (
    dbType?: DatabaseOptions,
  ): Promise<void> => {
    if (dbType) {
      const config = databasesConfig.find(db => db.type === dbType)
      if (!config)
        throw new Error(`No configuration found for database type: ${dbType}`)
      if (this.ormInstances == null) this.ormInstances = Object.create({})
      this.ormInstances[dbType] = await MikroORM.init(config.options as Options)
      Log.success(
        `${TAG} dbConnect: Initialized ${dbType} database connection.`,
      )
    } else {
      for (const dbConfig of databasesConfig) {
        const { type, options } = dbConfig
        this.ormInstances[type] = await MikroORM.init(options as Options)
        Log.success(
          `${TAG} dbConnect: Initialized ${type} database connection.`,
        )
      }
    }
  }

  /**
   * Establishes a connection to the specified database type and returns an initialized MikroORM instance.
   *
   * @param {DatabaseOptions} dbType - The type of database to connect to.
   * @returns {Promise<MikroORM>} A promise that resolves to an initialized MikroORM instance.
   * @throws {Error} Throws an error if the connection for the specified database type has not been initialized.
   */
  public dbConnection: (dbType: DatabaseOptions) => Promise<MikroORM> = async (
    dbType: DatabaseOptions,
  ): Promise<MikroORM> => {
    const orm = this.ormInstances[dbType]
    if (!orm) {
      throw new Error(
        `Database connection for ${dbType} has not been initialized.`,
      )
    }
    return orm
  }

  /**
   * Runs migrations for the specified database type or all databases if no type is provided.
   *
   * @param {DatabaseOptions} [dbType] - The optional type of the database to migrate.
   *                                     If omitted, all available databases will be migrated.
   * @returns {Promise<void>} - A promise that resolves once the migrations are complete.
   */
  public async migrate(dbType?: DatabaseOptions): Promise<void> {
    if (dbType) {
      const orm = await this.dbConnection(dbType)
      await orm.getMigrator().up()
      Log.success(
        `${TAG} migrate: Completed migrations for ${dbType}.
                `,
      )
    } else {
      for (const dbTypeKey of Object.keys(
        this.ormInstances,
      ) as unknown as DatabaseOptions[]) {
        const orm = await this.dbConnection(dbTypeKey)
        await orm.getMigrator().up()
        Log.success(`${TAG} migrate: Completed migrations for  ${dbTypeKey}.`)
      }
    }
  }

  /**
   * Returns the first database type if available.
   * If no active database type is found, returns `undefined`.
   *
   * @returns {string | undefined} The first active DatabaseOptions key or undefined.
   */
  public getFirstAvailableDatabase(): string | undefined {
    if (databasesConfig.length > 0) return databasesConfig[0].type
    return undefined
  }
}
