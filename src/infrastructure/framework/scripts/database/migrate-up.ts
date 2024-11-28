import 'reflect-metadata'
import Database from '../../../../data/database/Database'
import { DatabaseOptions } from '@framework/types/DatabaseConfig'
import Log from '@logger/Log'
import process from 'process'

export function getDatabaseOption(arg: string): DatabaseOptions | undefined {
  process.stdout.write(arg)
  const dbTypeMap: { [key: string]: DatabaseOptions } = {
    postgres: DatabaseOptions.postgres,
    mysql: DatabaseOptions.mysql,
    mongodb: DatabaseOptions.mongodb,
  }
  return dbTypeMap[arg.toLowerCase()]
}

async function runMigrationsUp() {
  const database = new Database()
  try {
    let dbTypeArg = process.argv[2]
      ? getDatabaseOption(process.argv[2])
      : getDatabaseOption(database.getFirstAvailableDatabase())

    if (!dbTypeArg) throw new Error('Database type not specified.')
    await database.dbConnect(dbTypeArg)
    const orm = await database.dbConnection(dbTypeArg)
    const migrator = orm.getMigrator()
    await migrator.createMigration()
    Log.success('Migration file created successfully.')
    await database.migrate(dbTypeArg)
    Log.success('All migrations have been successfully applied.')
  } catch (error) {
    Log.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await database.dbClose()
    process.exit(0)
  }
}

runMigrationsUp()
  .then(() => Log.success('🚀 Done 🚀'))
  .catch(() => Log.error('Error running migrations.'))
