import Database from "../../../../data/database/Database";
import process from "process";
import Log from "@logger/Log";
import fs from "fs";
import path from "path";
import { getDatabaseOption } from "@framework/scripts/database/migrate-up";
import {findRootDirectory} from "@helpers";


async function clearMigrationsFolder(migrationsFolder) {
    try {
        const files = fs.readdirSync(migrationsFolder);
        for (const file of files) {
            fs.unlinkSync(path.join(migrationsFolder, file));
        }
        Log.success("Migrations folder cleared.");
    } catch (error) {
        Log.error("Failed to clear migrations folder:", error);
    }
}


async function runFreshMigration() {
    const database = new Database();
    try {
        const dbTypeArg = process.argv[2]
            ? getDatabaseOption(process.argv[2])
            : getDatabaseOption(database.getFirstAvailableDatabase());
        if (!dbTypeArg) throw new Error("Database type not specified.");
        await database.dbConnect(dbTypeArg);
        const orm = await database.dbConnection(dbTypeArg);
        const migrator = orm.getMigrator();
        await migrator.down();
        await database.migrate(dbTypeArg);
        const migrationsFolder = path.join(findRootDirectory(path.resolve('./')), "src/data/database/migrations");
        await clearMigrationsFolder(migrationsFolder);
        await migrator.createMigration();
        await migrator.up();
        Log.success("Fresh migration applied successfully.");
        await database.migrate(dbTypeArg);
    } catch (error) {
        Log.error("Fresh migration failed:", error);
        process.exit(1);
    } finally {
        await database.dbClose();
        process.exit(0);
    }
}

runFreshMigration()
    .then(() => Log.success("🚀 Fresh migration complete 🚀"))
    .catch(() => Log.error("Error running fresh migration."));
