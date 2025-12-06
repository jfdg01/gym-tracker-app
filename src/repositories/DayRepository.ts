import { BaseRepository } from "./BaseRepository";
import { days, day_exercises, exercises } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewDay = InferInsertModel<typeof days>;

export class DayRepository extends BaseRepository<typeof days> {
    constructor() {
        super(days);
    }

    async create(day: NewDay) {
        const result = await this.db.insert(days).values(day).returning();
        return result[0];
    }

    async update(id: number, day: Partial<NewDay>) {
        const result = await this.db.update(days)
            .set(day)
            .where(eq(days.id, id))
            .returning();
        return result[0];
    }

    async getByProgramId(programId: number) {
        return await this.db.select().from(days).where(eq(days.program_id, programId));
    }

    async getDayExercises(dayId: number) {
        return await this.db.select().from(day_exercises).where(eq(day_exercises.day_id, dayId));
    }

    async getDayExercisesWithDetails(dayId: number) {
        return await this.db.select({
            id: day_exercises.id,
            day_id: day_exercises.day_id,
            exercise_id: day_exercises.exercise_id,
            order_index: day_exercises.order_index,
            target_sets: day_exercises.target_sets,
            target_reps: day_exercises.target_reps,
            target_weight: day_exercises.target_weight,
            increase_rate: day_exercises.increase_rate,
            rest_time_seconds: day_exercises.rest_time_seconds,
            name: exercises.name,
            description: exercises.description,
        })
            .from(day_exercises)
            .innerJoin(exercises, eq(day_exercises.exercise_id, exercises.id))
            .where(eq(day_exercises.day_id, dayId))
            .orderBy(day_exercises.order_index);
    }
}
