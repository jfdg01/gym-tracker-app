import { db } from './client';
import * as schema from './schema';
import { eq, desc, and } from 'drizzle-orm';

export type WorkoutExerciseSet = typeof schema.workout_exercise_sets.$inferSelect;
export type NewWorkoutExerciseSet = typeof schema.workout_exercise_sets.$inferInsert;

/**
 * Create a new workout exercise set
 * @param data Set data (id will be auto-generated)
 * @returns The created workout set
 */
export const createWorkoutSet = async (data: Omit<NewWorkoutExerciseSet, 'id'>): Promise<WorkoutExerciseSet> => {
    const result = await db.insert(schema.workout_exercise_sets)
        .values(data)
        .returning();
    return result[0];
};

/**
 * Get all sets for a specific workout
 * @param workoutLogId The workout log ID
 * @returns Array of workout sets
 */
export const getWorkoutSets = async (workoutLogId: number): Promise<WorkoutExerciseSet[]> => {
    return await db.select()
        .from(schema.workout_exercise_sets)
        .where(eq(schema.workout_exercise_sets.workout_log_id, workoutLogId))
        .orderBy(schema.workout_exercise_sets.exercise_id, schema.workout_exercise_sets.set_number);
};

/**
 * Get recent sets for a specific exercise (for progression tracking)
 * @param exerciseId The exercise ID
 * @param limit Maximum number of sets to return
 * @returns Array of recent sets for the exercise
 */
export const getExerciseSets = async (exerciseId: number, limit: number = 50): Promise<WorkoutExerciseSet[]> => {
    return await db.select()
        .from(schema.workout_exercise_sets)
        .where(eq(schema.workout_exercise_sets.exercise_id, exerciseId))
        .orderBy(desc(schema.workout_exercise_sets.created_at))
        .limit(limit);
};

/**
 * Update a workout set
 * @param id The set ID
 * @param data Partial set data to update
 * @returns The updated set
 */
export const updateWorkoutSet = async (id: number, data: Partial<Omit<NewWorkoutExerciseSet, 'id'>>): Promise<WorkoutExerciseSet> => {
    const result = await db.update(schema.workout_exercise_sets)
        .set(data)
        .where(eq(schema.workout_exercise_sets.id, id))
        .returning();
    return result[0];
};

/**
 * Delete a workout set
 * @param id The set ID to delete
 */
export const deleteWorkoutSet = async (id: number): Promise<void> => {
    await db.delete(schema.workout_exercise_sets)
        .where(eq(schema.workout_exercise_sets.id, id));
};

/**
 * Get all sets for a specific exercise in a specific workout
 * @param workoutLogId The workout log ID
 * @param exerciseId The exercise ID
 * @returns Array of sets
 */
export const getWorkoutExerciseSets = async (workoutLogId: number, exerciseId: number): Promise<WorkoutExerciseSet[]> => {
    return await db.select()
        .from(schema.workout_exercise_sets)
        .where(
            and(
                eq(schema.workout_exercise_sets.workout_log_id, workoutLogId),
                eq(schema.workout_exercise_sets.exercise_id, exerciseId)
            )
        )
        .orderBy(schema.workout_exercise_sets.set_number);
};
