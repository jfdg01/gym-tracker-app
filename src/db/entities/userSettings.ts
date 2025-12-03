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
    const settings = await db.select().from(schema.user_settings).limit(1);

    if (settings.length > 0) {
        return settings[0];
    }

    // Create default settings if none exist
    const result = await db.insert(schema.user_settings)
        .values({
            language: 'en',
            name: 'User',
            current_day_index: 0
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
export const updateUserSettings = async (data: Partial<NewUserSettings>): Promise<UserSettings> => {
    const settings = await db.select().from(schema.user_settings).limit(1);

    if (settings.length > 0) {
        const result = await db.update(schema.user_settings)
            .set(data)
            .where(eq(schema.user_settings.id, settings[0].id))
            .returning();
        return result[0];
    }

    // Create with provided data if settings don't exist
    const result = await db.insert(schema.user_settings)
        .values({
            language: 'en',
            name: 'User',
            current_day_index: 0,
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
 * Update the current day index
 */
export const updateCurrentDayIndex = async (dayIndex: number): Promise<void> => {
    await updateUserSettings({ current_day_index: dayIndex });
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
