import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { sql, eq } from 'drizzle-orm';

export const BackupService = {
    exportData: async () => {
        try {
            // 1. Fetch all data
            const userSettings = await db.select().from(schema.user_settings);
            const exercises = await db.select().from(schema.exercises);
            const programs = await db.select().from(schema.programs);
            const days = await db.select().from(schema.days);
            const dayExercises = await db.select().from(schema.day_exercises);

            // Filter user settings to exclude personal info
            const sanitizedSettings = userSettings.map(setting => ({
                ...setting,
                name: undefined,
                language: undefined,
                id: undefined // Don't export ID either
            }));

            const backupData = {
                version: 1,
                timestamp: new Date().toISOString(),
                data: {
                    user_settings: sanitizedSettings,
                    exercises,
                    programs,
                    days,
                    day_exercises: dayExercises,
                },
            };

            // 2. Create a file
            const fileUri = FileSystem.documentDirectory + 'gym_tracker_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

            // 3. Share the file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export Backup',
                    UTI: 'public.json',
                });
            } else {
                throw new Error('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    },

    importData: async () => {
        try {
            // 1. Pick a file
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return false;
            }

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const backup = JSON.parse(fileContent);

            // Basic validation
            if (!backup.data || !backup.version) {
                throw new Error('Invalid backup file format');
            }

            const { data } = backup;

            // 2. Restore data with ID remapping
            // We cannot use a transaction easily with async/await loops and logic in some drivers, 
            // but we'll try to keep it safe.

            // Maps to store OldID -> NewID
            const exerciseMap = new Map<number, number>();
            const programMap = new Map<number, number>();
            const dayMap = new Map<number, number>();

            // A. Exercises
            // Fetch existing exercises to check for duplicates by name
            const existingExercises = await db.select().from(schema.exercises);
            const existingExerciseMap = new Map(existingExercises.map(e => [e.name.toLowerCase(), e.id]));

            for (const exercise of data.exercises) {
                const oldId = exercise.id;
                const normalizedName = exercise.name.toLowerCase();

                if (existingExerciseMap.has(normalizedName)) {
                    // Reuse existing exercise
                    exerciseMap.set(oldId, existingExerciseMap.get(normalizedName)!);
                } else {
                    // Create new exercise
                    // We must remove the ID to let SQLite auto-increment
                    const { id, ...exerciseData } = exercise;
                    const result = await db.insert(schema.exercises).values(exerciseData).returning({ insertedId: schema.exercises.id });
                    const newId = result[0].insertedId;
                    exerciseMap.set(oldId, newId);
                    // Add to local map to avoid duplicates within the import itself if any
                    existingExerciseMap.set(normalizedName, newId);
                }
            }

            // B. Programs
            for (const program of data.programs) {
                const oldId = program.id;
                const { id, ...programData } = program;

                // Always create new program to avoid merging logic complexity for now
                // Append (Imported) to name if you wanted, but user might want same name.
                const result = await db.insert(schema.programs).values(programData).returning({ insertedId: schema.programs.id });
                const newId = result[0].insertedId;
                programMap.set(oldId, newId);
            }

            // C. Days
            for (const day of data.days) {
                const oldId = day.id;
                const { id, program_id, ...dayData } = day;

                const newProgramId = programMap.get(program_id);
                if (newProgramId) {
                    const result = await db.insert(schema.days).values({
                        ...dayData,
                        program_id: newProgramId
                    }).returning({ insertedId: schema.days.id });
                    const newId = result[0].insertedId;
                    dayMap.set(oldId, newId);
                }
            }

            // D. Day Exercises
            for (const dayExercise of data.day_exercises) {
                const { id, day_id, exercise_id, ...dayExerciseData } = dayExercise;

                const newDayId = dayMap.get(day_id);
                const newExerciseId = exerciseMap.get(exercise_id);

                if (newDayId && newExerciseId) {
                    await db.insert(schema.day_exercises).values({
                        ...dayExerciseData,
                        day_id: newDayId,
                        exercise_id: newExerciseId
                    });
                }
            }

            // E. User Settings
            // If the backup has settings, we update the CURRENT user's settings to point to the imported program
            if (data.user_settings && data.user_settings.length > 0) {
                const importedSettings = data.user_settings[0];
                const oldProgramId = importedSettings.current_program_id;
                const newProgramId = programMap.get(oldProgramId);

                if (newProgramId) {
                    // Update the single user settings row we assume exists
                    const currentSettings = await db.select().from(schema.user_settings).limit(1);
                    if (currentSettings.length > 0) {
                        await db.update(schema.user_settings)
                            .set({
                                current_program_id: newProgramId,
                                current_day_index: importedSettings.current_day_index || 0
                            })
                            .where(eq(schema.user_settings.id, currentSettings[0].id));
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    },
};
