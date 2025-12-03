import { BaseRepository } from "./BaseRepository";
import { user_settings } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewUserSettings = InferInsertModel<typeof user_settings>;

export class UserRepository extends BaseRepository<typeof user_settings> {
    constructor() {
        super(user_settings);
    }

    async getSettings() {
        // Singleton, ID is always 1
        const result = await this.db.select().from(user_settings).where(eq(user_settings.id, 1));
        return result[0];
    }

    async updateSettings(settings: Partial<NewUserSettings>) {
        const result = await this.db.update(user_settings)
            .set(settings)
            .where(eq(user_settings.id, 1))
            .returning();
        return result[0];
    }

    async ensureSettingsExist() {
        const existing = await this.getSettings();
        if (!existing) {
            await this.db.insert(user_settings).values({ id: 1 }).returning();
        }
    }
}
