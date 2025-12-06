import { WorkoutRepository, NewWorkoutLog, NewWorkoutSet } from "../repositories/WorkoutRepository";
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

    async logSet(set: NewWorkoutSet) {
        return await this.workoutRepository.createSet(set);
    }

    async getSetsForWorkout(workoutLogId: number) {
        return await this.workoutRepository.getSetsByLogId(workoutLogId);
    }


    async getDayWithExercises(dayId: number) {
        const day = await this.dayRepository.getById(dayId);
        if (!day) {
            throw new Error('Day not found');
        }
        const exercises = await this.dayRepository.getDayExercisesWithDetails(dayId);
        return { day, exercises };
    }

    async initializeWorkout(dayId: number, programId: number) {
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

        if (!completedLog || !completedLog.day_id) return;

        // 2. Update User Settings (Last Day Completed)
        await this.userRepository.updateSettings({
            last_day_id: completedLog.day_id
        });

        // 3. Progressive Overload
        const sets = await this.workoutRepository.getSetsByLogId(logId);
        const dayExercises = await this.dayRepository.getDayExercises(completedLog.day_id);

        for (const dayExercise of dayExercises) {
            // Find sets for this exercise
            const exerciseSets = sets.filter(s => s.day_exercise_id === dayExercise.id);
            if (exerciseSets.length === 0) continue;

            // Find the last performed set (assuming set_number order)
            // We sort just in case
            exerciseSets.sort((a, b) => a.set_number - b.set_number);
            const lastSet = exerciseSets[exerciseSets.length - 1];

            // Check if skipped
            if (lastSet.skipped) continue;

            // Check logic: Actual Reps >= Target Reps
            // We use the target_reps from the day_exercise (current config) or the set's snapshot?
            // The requirement says "If the user completes the last target set with actual reps >= target reps".
            // We should compare against the target that was set for THAT set.
            const targetReps = lastSet.target_reps || dayExercise.target_reps;

            if (lastSet.actual_reps && lastSet.actual_reps >= targetReps) {
                // Increase weight
                const currentWeight = dayExercise.target_weight || 0;
                const increase = dayExercise.increase_rate || 2.5;
                const newWeight = currentWeight + increase;

                await this.exerciseRepository.updateDayExercise(dayExercise.id, {
                    target_weight: newWeight
                });
            }
        }
    }
}
