import { WorkoutRepository, NewWorkoutLog } from "../repositories/WorkoutRepository";
import { DayRepository } from "../repositories/DayRepository";
import { ExerciseRepository } from "../repositories/ExerciseRepository";
import { UserRepository } from "../repositories/UserRepository";

export class WorkoutService {
    constructor(
        private workoutRepository: WorkoutRepository,
        private dayRepository: DayRepository,
        private exerciseRepository: ExerciseRepository,
        private userRepository: UserRepository
    ) { }

    async createWorkoutLog(log: NewWorkoutLog) {
        return await this.workoutRepository.createLog(log);
    }

    async updateWorkoutLog(id: number, log: Partial<NewWorkoutLog>) {
        return await this.workoutRepository.updateLog(id, log);
    }

    async getDayWithExercises(dayId: number) {
        const day = await this.dayRepository.getById(dayId);
        if (!day) {
            throw new Error('Day not found');
        }
        const exercises = await this.dayRepository.getDayExercisesWithDetails(dayId);
        return { day, exercises };
    }

    async startWorkout(dayId: number, programId: number | null) {
        // Create a new workout log with created_at
        const log: NewWorkoutLog = {
            day_id: dayId,
            program_id: programId,
            created_at: new Date(),
        };

        const result = await this.workoutRepository.createLog(log);
        return result.id;
    }

    async completeWorkout(logId: number, setLogs: any[], isCompleted: boolean) {
        // 1. Mark as completed (update timestamp) if fully completed
        if (isCompleted) {
            await this.workoutRepository.updateLog(logId, {
                completed_at: new Date()
            });
        }

        // 2. Save Set Logs
        if (setLogs.length > 0) {
            // Map setLogs to include workout_log_id
            const logsToSave = setLogs.map(log => ({
                ...log,
                workout_log_id: logId
            }));
            await this.workoutRepository.createSetLogs(logsToSave);
        }

        // 3. Update User Program Progress (Last Completed Day) ONLY if completed
        if (isCompleted) {
            // Fetch the log to get program_id and day_id
            const completedLog = await this.workoutRepository.getById(logId);

            if (!completedLog || !completedLog.day_id || !completedLog.program_id) return;

            const userPrograms = await this.userRepository.getUserPrograms();
            const activeProgram = userPrograms.find(up => up.program_id === completedLog.program_id);

            if (activeProgram) {
                await this.userRepository.updateUserProgram(activeProgram.id, {
                    last_completed_day_id: completedLog.day_id
                });
            }
        }
    }

    async getAllWorkoutLogs() {
        return await this.workoutRepository.getAll();
    }

    async importWorkoutLogs(data: any[]) {
        return await this.workoutRepository.importMany(data);
    }
}
