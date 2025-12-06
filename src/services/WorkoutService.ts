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

    async initializeWorkout(dayId: number, programId: number | null) {
        // Create a new workout log
        const log: NewWorkoutLog = {
            day_id: dayId,
            program_id: programId,
        };

        return await this.workoutRepository.createLog(log);
    }

    async completeWorkout(logId: number) {
        // 1. Mark as completed (update timestamp)
        const completedLog = await this.workoutRepository.updateLog(logId, {
            completed_at: new Date()
        });

        if (!completedLog || !completedLog.day_id || !completedLog.program_id) return;

        // 2. Update User Program Progress (Last Completed Day)
        // Find the user program entry for this program
        // Assuming single user for now or we need logic to find specific user program
        // This part requires checking if a UserProgram exists for this program
        const userPrograms = await this.userRepository.getUserPrograms();
        const activeProgram = userPrograms.find(up => up.program_id === completedLog.program_id);

        if (activeProgram) {
            await this.userRepository.updateUserProgram(activeProgram.id, {
                last_completed_day_id: completedLog.day_id
            });
        }
    }
}
