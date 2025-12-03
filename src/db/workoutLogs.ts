import { db } from './client';
import * as schema from './schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export type WorkoutLog = typeof schema.workout_logs.$inferSelect;
export type NewWorkoutLog = typeof schema.workout_logs.$inferInsert;

export interface WorkoutLogFilters {
    programId?: number;
    dayId?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface WorkoutStats {
    totalWorkouts: number;
    totalDuration: number; // in seconds
    averageDuration: number; // in seconds
    lastWorkoutDate?: Date;
}

/**
 * Create a new workout log entry
 * @param data Workout log data (id will be auto-generated)
 * @returns The created workout log
 */
export const createWorkoutLog = async (data: Omit<NewWorkoutLog, 'id'>): Promise<WorkoutLog> => {
    const result = await db.insert(schema.workout_logs)
        .values(data)
        .returning();
    return result[0];
};

/**
 * Get workout logs with optional filters
 * @param filters Optional filters for querying logs
 * @returns Array of workout logs
 */
export const getWorkoutLogs = async (filters?: WorkoutLogFilters): Promise<WorkoutLog[]> => {
    let query = db.select().from(schema.workout_logs);

    const conditions = [];

    if (filters?.programId !== undefined) {
        conditions.push(eq(schema.workout_logs.program_id, filters.programId));
    }

    if (filters?.dayId !== undefined) {
        conditions.push(eq(schema.workout_logs.day_id, filters.dayId));
    }

    if (filters?.startDate) {
        conditions.push(gte(schema.workout_logs.completed_at, filters.startDate));
    }

    if (filters?.endDate) {
        conditions.push(lte(schema.workout_logs.completed_at, filters.endDate));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(schema.workout_logs.completed_at));
};

/**
 * Get the most recent workout logs
 * @param limit Maximum number of logs to return
 * @returns Array of recent workout logs
 */
export const getRecentWorkoutLogs = async (limit: number = 10): Promise<WorkoutLog[]> => {
    return await db.select()
        .from(schema.workout_logs)
        .orderBy(desc(schema.workout_logs.completed_at))
        .limit(limit);
};

/**
 * Get all workout logs for a specific program
 * @param programId The program ID to filter by
 * @returns Array of workout logs for the program
 */
export const getWorkoutLogsByProgram = async (programId: number): Promise<WorkoutLog[]> => {
    return await getWorkoutLogs({ programId });
};

/**
 * Delete a workout log
 * @param id The workout log ID to delete
 */
export const deleteWorkoutLog = async (id: number): Promise<void> => {
    await db.delete(schema.workout_logs)
        .where(eq(schema.workout_logs.id, id));
};

/**
 * Get workout statistics
 * @param programId Optional program ID to filter stats
 * @returns Workout statistics
 */
export const getWorkoutStats = async (programId?: number): Promise<WorkoutStats> => {
    const logs = programId
        ? await getWorkoutLogsByProgram(programId)
        : await db.select().from(schema.workout_logs);

    const totalWorkouts = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
    const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

    const lastWorkoutDate = logs.length > 0 && logs[0].completed_at
        ? new Date(logs[0].completed_at)
        : undefined;

    return {
        totalWorkouts,
        totalDuration,
        averageDuration,
        lastWorkoutDate
    };
};
