import { WorkoutRepository } from "../repositories/WorkoutRepository";
import { workout_logs, workout_exercise_sets } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

type NewWorkoutLog = InferInsertModel<typeof workout_logs>;
type NewWorkoutSet = InferInsertModel<typeof workout_exercise_sets>;

export class WorkoutService {
    constructor(private workoutRepository: WorkoutRepository) { }

    async createWorkoutLog(log: NewWorkoutLog) {
        return await this.workoutRepository.createLog(log);
    }

    async updateWorkoutLog(id: number, log: Partial<NewWorkoutLog>) {
        return await this.workoutRepository.updateLog(id, log);
    }

    async logSet(set: NewWorkoutSet) {
        return await this.workoutRepository.createSet(set);
    }

    async getSetsForWorkout(workoutLogId: number) {
        return await this.workoutRepository.getSetsByLogId(workoutLogId);
    }
}
