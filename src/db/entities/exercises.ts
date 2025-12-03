import { db } from '../client';
import * as schema from '../schema';
import { eq, desc } from 'drizzle-orm';

export type NewExercise = typeof schema.exercises.$inferInsert;
export type Exercise = typeof schema.exercises.$inferSelect;

export const getAllExercises = async () => {
    return await db.select().from(schema.exercises).orderBy(desc(schema.exercises.id));
};

export const getExerciseById = async (id: number) => {
    const result = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return result[0];
};

export const createExercise = async (data: Omit<NewExercise, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await db.insert(schema.exercises).values(data).returning();
    return result[0];
};

export const updateExercise = async (id: number, data: Partial<Omit<NewExercise, 'id' | 'created_at' | 'updated_at'>>) => {
    const result = await db.update(schema.exercises)
        .set({ ...data, updated_at: new Date() })
        .where(eq(schema.exercises.id, id))
        .returning();
    return result[0];
};

export const deleteExercise = async (id: number) => {
    await db.delete(schema.exercises).where(eq(schema.exercises.id, id));
};
