import { WorkoutRepository } from "../WorkoutRepository";
import { workout_logs, workout_exercise_sets } from "../../db/schema";
import { db } from "../../db/client";
import { eq } from "drizzle-orm";

jest.mock("../../db/client", () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("WorkoutRepository", () => {
    let repository: WorkoutRepository;
    const mockDb = db as jest.Mocked<typeof db>;

    beforeEach(() => {
        repository = new WorkoutRepository();
        jest.clearAllMocks();
    });

    describe("createLog", () => {
        it("should create a workout log", async () => {
            const newLog = { program_id: 1, day_id: 1 };
            const mockResult = [{ id: 1, ...newLog }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.createLog(newLog);

            expect(mockDb.insert).toHaveBeenCalledWith(workout_logs);
            expect(mockValues).toHaveBeenCalledWith(newLog);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("updateLog", () => {
        it("should update a workout log", async () => {
            const updateData = { duration_seconds: 3600 };
            const mockResult = [{ id: 1, ...updateData }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
            const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
            mockDb.update.mockImplementation(mockUpdate);

            const result = await repository.updateLog(1, updateData);

            expect(mockDb.update).toHaveBeenCalledWith(workout_logs);
            expect(mockSet).toHaveBeenCalledWith(updateData);
            expect(mockWhere).toHaveBeenCalledWith(eq(workout_logs.id, 1));
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("createSet", () => {
        it("should create a workout set", async () => {
            const newSet = { workout_log_id: 1, exercise_id: 1, set_number: 1 };
            const mockResult = [{ id: 1, ...newSet }];
            const mockReturning = jest.fn().mockResolvedValue(mockResult);
            const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
            mockDb.insert.mockImplementation(mockInsert);

            const result = await repository.createSet(newSet);

            expect(mockDb.insert).toHaveBeenCalledWith(workout_exercise_sets);
            expect(mockValues).toHaveBeenCalledWith(newSet);
            expect(result).toEqual(mockResult[0]);
        });
    });

    describe("getSetsByLogId", () => {
        it("should return sets for a log", async () => {
            const mockResult = [{ id: 1, workout_log_id: 1 }];
            const mockWhere = jest.fn().mockResolvedValue(mockResult);
            const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select.mockImplementation(mockSelect);

            const result = await repository.getSetsByLogId(1);

            expect(mockDb.select).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith(workout_exercise_sets);
            expect(mockWhere).toHaveBeenCalledWith(eq(workout_exercise_sets.workout_log_id, 1));
            expect(result).toEqual(mockResult);
        });
    });
});
