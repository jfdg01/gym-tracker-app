import { db } from '../client';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

export type UserSettings = typeof schema.user_settings.$inferSelect;
export type NewUserSettings = typeof schema.user_settings.$inferInsert;

/**
 * Get current user settings. Always returns a settings object.
 * Creates default settings if none exist.
 */
export const getUserSettings = async (): Promise<UserSettings> => {
    const settings = await db.select().from(schema.user_settings).where(eq(schema.user_settings.id, 1));

    if (settings.length > 0) {
        return settings[0];
    }

    // Create default settings if none exist (enforced singleton with id=1)
    const result = await db.insert(schema.user_settings)
        .values({
            id: 1,
            language: 'es',
            name: 'User'
        })
        .returning();

    return result[0];
};

/**
 * Ensure user settings exist and return them.
 * Alias for getUserSettings for semantic clarity.
 */
export const ensureUserSettings = getUserSettings;

/**
 * Update user settings. Creates settings if they don't exist.
 * @param data Partial user settings data to update
 * @returns Updated user settings
 */
export const updateUserSettings = async (data: Partial<Omit<NewUserSettings, 'id'>>): Promise<UserSettings> => {
    const settings = await db.select().from(schema.user_settings).where(eq(schema.user_settings.id, 1));

    if (settings.length > 0) {
        const result = await db.update(schema.user_settings)
            .set(data)
            .where(eq(schema.user_settings.id, 1))
            .returning();
        return result[0];
    }

    // Create with provided data if settings don't exist (enforced singleton with id=1)
    const result = await db.insert(schema.user_settings)
        .values({
            id: 1,
            language: 'es',
            name: 'User',
            ...data
        })
        .returning();

    return result[0];
};

/**
 * Update the current program ID
 */
export const updateCurrentProgram = async (programId: number | null): Promise<void> => {
    await updateUserSettings({ current_program_id: programId });
};

/**
 * Update the last completed day ID
 */
export const updateLastDayId = async (dayId: number | null): Promise<void> => {
    await updateUserSettings({ last_day_id: dayId });
};

/**
 * Update the user's preferred language
 */
export const updateLanguage = async (language: string): Promise<void> => {
    await updateUserSettings({ language });
};

/**
 * Update the user's name
 */
export const updateName = async (name: string): Promise<void> => {
    await updateUserSettings({ name });
};
