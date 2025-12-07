import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as schema from "./schema";
import migrations from "../../drizzle/migrations";

const expoDb = openDatabaseSync("gym-tracker.db");
export const db = drizzle(expoDb, { schema });

// Run migrations using Drizzle's migration system
// Export the hook for use in _layout.tsx
export const useAppMigrations = () => {
    return useMigrations(db, migrations);
};
