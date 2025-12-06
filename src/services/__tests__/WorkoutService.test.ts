import { WorkoutService } from "../WorkoutService";
import { WorkoutRepository } from "../../repositories/WorkoutRepository";
import { DayRepository } from "../../repositories/DayRepository";
import { ExerciseRepository } from "../../repositories/ExerciseRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { generateRandomWorkoutSet } from "../testUtils";

// Mock repositories
const mockWorkoutRepository = {
    createLog: jest.fn(),
    updateLog: jest.fn(),
    createSet: jest.fn(),
    getSetsByLogId: jest.fn(),
} as unknown as WorkoutRepository;

const mockDayRepository = {
    getDayExercises: jest.fn(),
} as unknown as DayRepository;

const mockExerciseRepository = {
    updateDayExercise: jest.fn(),
} as unknown as ExerciseRepository;

const mockUserRepository = {
    updateSettings: jest.fn(),
} as unknown as UserRepository;

describe('WorkoutService', () => {
    let workoutService: WorkoutService;

    beforeEach(() => {
        workoutService = new WorkoutService(
            mockWorkoutRepository,
            mockDayRepository,
            mockExerciseRepository,
            mockUserRepository
        );
        jest.clearAllMocks();
    });

    describe('completeWorkout', () => {
        it('should mark workout as completed and update user settings', async () => {
            const logId = 1;
            const dayId = 5;

            (mockWorkoutRepository.updateLog as jest.Mock).mockResolvedValue({ id: logId, day_id: dayId });
            (mockWorkoutRepository.getSetsByLogId as jest.Mock).mockResolvedValue([]);
            (mockDayRepository.getDayExercises as jest.Mock).mockResolvedValue([]);

            await workoutService.completeWorkout(logId);

            expect(mockWorkoutRepository.updateLog).toHaveBeenCalledWith(logId, {
                completed_at: expect.any(Date)
            });
            expect(mockUserRepository.updateSettings).toHaveBeenCalledWith({
                last_day_id: dayId
            });
        });

        it('should trigger progressive overload when target is met', async () => {
            const logId = 1;
            const dayId = 5;
            const dayExerciseId = 10;
            const exerciseId = 20;

            const dayExercise = {
                id: dayExerciseId,
                exercise_id: exerciseId,
                target_reps: 10,
                target_weight: 50,
                increase_rate: 2.5
            };

            const set = {
                ...generateRandomWorkoutSet(),
                day_exercise_id: dayExerciseId,
                set_number: 1,
                actual_reps: 10, // Met target
                target_reps: 10,
                skipped: false
            };

            (mockWorkoutRepository.updateLog as jest.Mock).mockResolvedValue({ id: logId, day_id: dayId });
            (mockWorkoutRepository.getSetsByLogId as jest.Mock).mockResolvedValue([set]);
            (mockDayRepository.getDayExercises as jest.Mock).mockResolvedValue([dayExercise]);

            await workoutService.completeWorkout(logId);

            expect(mockExerciseRepository.updateDayExercise).toHaveBeenCalledWith(dayExerciseId, {
                target_weight: 52.5 // 50 + 2.5
            });
        });

        it('should NOT trigger progressive overload when target is NOT met', async () => {
            const logId = 1;
            const dayId = 5;
            const dayExerciseId = 10;

            const dayExercise = {
                id: dayExerciseId,
                target_reps: 10,
                target_weight: 50,
                increase_rate: 2.5
            };

            const set = {
                ...generateRandomWorkoutSet(),
                day_exercise_id: dayExerciseId,
                set_number: 1,
                actual_reps: 9, // Failed target
                target_reps: 10,
                skipped: false
            };

            (mockWorkoutRepository.updateLog as jest.Mock).mockResolvedValue({ id: logId, day_id: dayId });
            (mockWorkoutRepository.getSetsByLogId as jest.Mock).mockResolvedValue([set]);
            (mockDayRepository.getDayExercises as jest.Mock).mockResolvedValue([dayExercise]);

            await workoutService.completeWorkout(logId);

            expect(mockExerciseRepository.updateDayExercise).not.toHaveBeenCalled();
        });
    });
});
