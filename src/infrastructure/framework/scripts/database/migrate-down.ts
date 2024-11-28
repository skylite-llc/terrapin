import Database from "../../../../data/database/Database";
import process from "process";
import Log from "@logger/Log";
import { getDatabaseOption } from "@framework/scripts/database/migrate-up";

async function runMigrationsDown() {
    const database = new Database();
    try {
        const dbTypeArg = process.argv[2]
            ? getDatabaseOption(process.argv[2])
            : getDatabaseOption(database.getFirstAvailableDatabase());
        if (!dbTypeArg) throw new Error("Database type not specified.");
        await database.dbConnect(dbTypeArg);
        const orm = await database.dbConnection(dbTypeArg);
        const migrator = orm.getMigrator();
        const steps = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;
        const toMigration = process.argv[4] ? process.argv[4] : undefined;
        if (steps) {
            await migrator.down({ transaction: true, to: steps });
            Log.success(`Rolled back ${steps} migration(s) successfully.`);
        } else if (toMigration) {
            await migrator.down({ transaction: true, to: toMigration });
            Log.success(`Rolled back to migration: ${toMigration} successfully.`);
        } else {
            await migrator.down();
            Log.success("Rolled back the last migration successfully.");
        }
        await database.migrate(dbTypeArg);
        Log.success("All migrations have been successfully applied.");
    } catch (error) {
        Log.error("Migration failed:", error);
        process.exit(1);
    } finally {
        await database.dbClose();
        process.exit(0);
    }
}

runMigrationsDown()
    .then(() => Log.success("🚀 Done 🚀"))
    .catch(() => Log.error("Error running migrations."));
