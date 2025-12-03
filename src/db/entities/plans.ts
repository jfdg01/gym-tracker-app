import { db } from '../client';
import { programs, days, day_exercises, exercises } from '../schema';
import { eq, and, asc, desc } from 'drizzle-orm';

export type NewPlan = typeof programs.$inferInsert;
export type Plan = typeof programs.$inferSelect;
export type NewDay = typeof days.$inferInsert;
export type Day = typeof days.$inferSelect;
export type NewDayExercise = typeof day_exercises.$inferInsert;
export type DayExercise = typeof day_exercises.$inferSelect;

// --- Plan Management ---

export const createPlan = async (name: string, description?: string): Promise<number> => {
    const result = await db.insert(programs).values({ name, description }).returning({ insertedId: programs.id });
    return result[0].insertedId;
};

export const getPlans = async (): Promise<Plan[]> => {
    return await db.select().from(programs);
};

export const getPlanDetails = async (planId: number) => {
    const plan = await db.select().from(programs).where(eq(programs.id, planId)).get();
    if (!plan) return null;

    const planDays = await db.select().from(days)
        .where(eq(days.program_id, planId))
        .orderBy(asc(days.order_index));

    const daysWithExercises = await Promise.all(planDays.map(async (day) => {
        const exercisesInDay = await db.select({
            day_exercise_id: day_exercises.id,
            exercise_id: exercises.id,
            name: exercises.name,
            track_type: exercises.track_type,
            resistance_type: exercises.resistance_type,
            target_sets: day_exercises.target_sets,
            target_reps: day_exercises.target_reps,
            target_weight: day_exercises.target_weight,
            target_resistance_text: day_exercises.target_resistance_text,
            target_time_seconds: day_exercises.target_time_seconds,
            rest_time_seconds: day_exercises.rest_time_seconds,
            increase_rate: day_exercises.increase_rate,
            order_index: day_exercises.order_index
        })
            .from(day_exercises)
            .innerJoin(exercises, eq(day_exercises.exercise_id, exercises.id))
            .where(eq(day_exercises.day_id, day.id))
            .orderBy(asc(day_exercises.order_index));

        return {
            ...day,
            exercises: exercisesInDay
        };
    }));

    return {
        ...plan,
        days: daysWithExercises
    };
};

export const updatePlan = async (id: number, data: Partial<Omit<NewPlan, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    await db.update(programs).set({ ...data, updated_at: new Date() }).where(eq(programs.id, id));
};

export const deletePlan = async (id: number): Promise<void> => {
    // Cascade deletes are now handled automatically by the database
    await db.delete(programs).where(eq(programs.id, id));
};

// --- Day Management ---

export const addDayToPlan = async (planId: number, name: string): Promise<number> => {
    // Find the current max order_index
    const lastDay = await db.select({ order_index: days.order_index })
        .from(days)
        .where(eq(days.program_id, planId))
        .orderBy(desc(days.order_index))
        .limit(1)
        .get();

    const newOrderIndex = (lastDay?.order_index ?? -1) + 1;

    const result = await db.insert(days).values({
        program_id: planId,
        name,
        order_index: newOrderIndex,
        is_rest_day: false
    }).returning({ insertedId: days.id });

    return result[0].insertedId;
};

export const updateDay = async (dayId: number, data: Partial<Omit<NewDay, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    await db.update(days).set({ ...data, updated_at: new Date() }).where(eq(days.id, dayId));
};

export const deleteDay = async (dayId: number): Promise<void> => {
    await db.transaction(async (tx) => {
        const day = await tx.select().from(days).where(eq(days.id, dayId)).get();
        if (!day) return;

        // Cascade delete of day_exercises is handled automatically
        // Delete day
        await tx.delete(days).where(eq(days.id, dayId));

        // Reorder remaining days
        const remainingDays = await tx.select().from(days)
            .where(eq(days.program_id, day.program_id!))
            .orderBy(asc(days.order_index));

        for (let i = 0; i < remainingDays.length; i++) {
            if (remainingDays[i].order_index !== i) {
                await tx.update(days)
                    .set({ order_index: i, updated_at: new Date() })
                    .where(eq(days.id, remainingDays[i].id));
            }
        }
    });
};

export const reorderDays = async (planId: number, dayIds: number[]): Promise<void> => {
    await db.transaction(async (tx) => {
        for (let i = 0; i < dayIds.length; i++) {
            await tx.update(days)
                .set({ order_index: i })
                .where(and(eq(days.id, dayIds[i]), eq(days.program_id, planId)));
        }
    });
};

// --- Day Exercise Management ---

export const addExerciseToDay = async (dayId: number, exerciseId: number): Promise<number> => {
    const lastExercise = await db.select({ order_index: day_exercises.order_index })
        .from(day_exercises)
        .where(eq(day_exercises.day_id, dayId))
        .orderBy(desc(day_exercises.order_index))
        .limit(1)
        .get();

    const newOrderIndex = (lastExercise?.order_index ?? -1) + 1;

    const result = await db.insert(day_exercises).values({
        day_id: dayId,
        exercise_id: exerciseId,
        order_index: newOrderIndex
    }).returning({ insertedId: day_exercises.id });

    return result[0].insertedId;
};

export const removeExerciseFromDay = async (dayExerciseId: number): Promise<void> => {
    await db.transaction(async (tx) => {
        const target = await tx.select().from(day_exercises).where(eq(day_exercises.id, dayExerciseId)).get();
        if (!target) return;

        // Delete (cascade to workout_exercise_sets handled automatically)
        await tx.delete(day_exercises).where(eq(day_exercises.id, dayExerciseId));

        // Reorder remaining
        const remaining = await tx.select().from(day_exercises)
            .where(eq(day_exercises.day_id, target.day_id!))
            .orderBy(asc(day_exercises.order_index));

        for (let i = 0; i < remaining.length; i++) {
            if (remaining[i].order_index !== i) {
                await tx.update(day_exercises)
                    .set({ order_index: i })
                    .where(eq(day_exercises.id, remaining[i].id));
            }
        }
    });
};

export const reorderExercisesInDay = async (dayId: number, dayExerciseIds: number[]): Promise<void> => {
    await db.transaction(async (tx) => {
        for (let i = 0; i < dayExerciseIds.length; i++) {
            await tx.update(day_exercises)
                .set({ order_index: i })
                .where(and(eq(day_exercises.id, dayExerciseIds[i]), eq(day_exercises.day_id, dayId)));
        }
    });
};

export const replaceExerciseInDay = async (dayExerciseId: number, newExerciseId: number): Promise<void> => {
    await db.update(day_exercises)
        .set({ exercise_id: newExerciseId })
        .where(eq(day_exercises.id, dayExerciseId));
};
