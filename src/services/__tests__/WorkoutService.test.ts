import { WorkoutService } from "../WorkoutService";
import { WorkoutRepository } from "../../repositories/WorkoutRepository";
import {
    generateRandomWorkoutLog,
    generateRandomPartialWorkoutLog,
    generateRandomWorkoutSet,
    getRandomNumber
} from "../testUtils";

const mockWorkoutRepository = {
    createLog: jest.fn(),
    updateLog: jest.fn(),
    createSet: jest.fn(),
    getSetsByLogId: jest.fn(),
} as unknown as WorkoutRepository;

describe('WorkoutService', () => {
    let service: WorkoutService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new WorkoutService(mockWorkoutRepository);
    });

    describe('Workout Log Operations', () => {
        it('should create a workout log', async () => {
            const newLog = generateRandomWorkoutLog();
            (mockWorkoutRepository.createLog as jest.Mock).mockResolvedValue({ id: 1, ...newLog });
            await service.createWorkoutLog(newLog);
            expect(mockWorkoutRepository.createLog).toHaveBeenCalledWith(newLog);
        });

        it('should update a workout log with fuzzy partials', async () => {
            const id = getRandomNumber();
            for (let i = 0; i < 50; i++) {
                const partial = generateRandomPartialWorkoutLog();
                (mockWorkoutRepository.updateLog as jest.Mock).mockResolvedValue({ id, ...partial });
                await service.updateWorkoutLog(id, partial);
                expect(mockWorkoutRepository.updateLog).toHaveBeenLastCalledWith(id, partial);
            }
        });
    });

    describe('Workout Set Operations', () => {
        it('should log a set', async () => {
            const newSet = generateRandomWorkoutSet();
            (mockWorkoutRepository.createSet as jest.Mock).mockResolvedValue({ id: 1, ...newSet });
            await service.logSet(newSet);
            expect(mockWorkoutRepository.createSet).toHaveBeenCalledWith(newSet);
        });

        it('should get sets for a workout', async () => {
            const logId = getRandomNumber();
            const sets = [generateRandomWorkoutSet(logId), generateRandomWorkoutSet(logId)];
            (mockWorkoutRepository.getSetsByLogId as jest.Mock).mockResolvedValue(sets);

            const result = await service.getSetsForWorkout(logId);

            expect(mockWorkoutRepository.getSetsByLogId).toHaveBeenCalledWith(logId);
            expect(result).toEqual(sets);
        });
    });
});
