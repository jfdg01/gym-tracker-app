import { WorkoutRepository, NewWorkoutLog, NewWorkoutSet } from "../repositories/WorkoutRepository";

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
