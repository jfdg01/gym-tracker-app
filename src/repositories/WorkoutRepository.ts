import { BaseRepository } from "./BaseRepository";
import { workout_logs, workout_exercise_sets } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewWorkoutLog = InferInsertModel<typeof workout_logs>;
export type NewWorkoutSet = InferInsertModel<typeof workout_exercise_sets>;

export class WorkoutRepository extends BaseRepository<typeof workout_logs> {
    constructor() {
        super(workout_logs);
    }

    async createLog(log: NewWorkoutLog) {
        const result = await this.db.insert(workout_logs).values(log).returning();
        return result[0];
    }

    async updateLog(id: number, log: Partial<NewWorkoutLog>) {
        const result = await this.db.update(workout_logs)
            .set(log)
            .where(eq(workout_logs.id, id))
            .returning();
        return result[0];
    }

    async createSet(set: NewWorkoutSet) {
        const result = await this.db.insert(workout_exercise_sets).values(set).returning();
        return result[0];
    }

    async getSetsByLogId(logId: number) {
        return await this.db.select().from(workout_exercise_sets).where(eq(workout_exercise_sets.workout_log_id, logId));
    }
}
