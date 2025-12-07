import { create } from 'zustand';
import { workoutService, programService, exerciseService } from '../../../services';
import * as schema from '../../../db/schema';

type ExerciseWithDetails = typeof schema.exercises.$inferSelect & {
    sets: number;
    order_index: number;
};

type SetStatus = {
    completed: boolean;
    reps?: number;
    time?: number;
    weight?: number;
    difficulty?: string | null;
};

interface WorkoutState {
    isLoading: boolean;
    isWorkoutActive: boolean;
    currentProgramId: number | null;
    currentDayId: number | null;
    workoutLogId: number | null;

    // Data
    exercises: ExerciseWithDetails[];
    exercisesStatus: { [exerciseId: number]: { skipped: boolean } };
    setsStatus: { [exerciseId: number]: { [setNum: number]: SetStatus } };

    // Actions
    startWorkout: (programId: number, dayId: number) => Promise<void>;
    completeSet: (exerciseId: number, setNumber: number, data: { reps?: number, time?: number, weight?: number, difficulty?: string | null }) => Promise<void>;
    skipExercise: (exerciseId: number) => Promise<void>;
    finishWorkout: () => Promise<void>;
    reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    isLoading: false,
    isWorkoutActive: false,
    currentProgramId: null,
    currentDayId: null,
    workoutLogId: null,
    exercises: [],
    exercisesStatus: {},
    setsStatus: {},

    startWorkout: async (programId, dayId) => {
        set({ isLoading: true });
        try {
            // 1. Get Exercises
            const dayExercises = await programService.getDayExercisesWithDetails(dayId);

            // 2. Start Log
            const workoutLogId = await workoutService.startWorkout(dayId, programId);

            // Initialize Status Map
            const setsStatus: { [exId: number]: { [s: number]: SetStatus } } = {};
            dayExercises.forEach(ex => {
                setsStatus[ex.id] = {};
                for (let i = 1; i <= ex.sets; i++) {
                    setsStatus[ex.id][i] = { completed: false };
                }
            });

            set({
                isWorkoutActive: true,
                currentProgramId: programId,
                currentDayId: dayId,
                workoutLogId: workoutLogId,
                exercises: dayExercises,
                setsStatus,
                exercisesStatus: {},
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to start workout", error);
            set({ isLoading: false });
        }
    },

    completeSet: async (exerciseId, setNumber, data) => {
        const { workoutLogId, setsStatus } = get();
        if (!workoutLogId) return;

        try {
            // Save to DB
            await workoutService.saveSetLog(workoutLogId, {
                exercise_id: exerciseId,
                set_number: setNumber,
                reps: data.reps ?? null,
                time: data.time ?? null,
                weight: data.weight ?? null,
                difficulty_qualitative: data.difficulty ?? null,
                is_skipped: false
            });

            // Update State
            const newSetsStatus = { ...setsStatus };
            if (!newSetsStatus[exerciseId]) newSetsStatus[exerciseId] = {};
            newSetsStatus[exerciseId][setNumber] = {
                completed: true,
                reps: data.reps,
                time: data.time,
                weight: data.weight,
                difficulty: data.difficulty
            };

            set({ setsStatus: newSetsStatus });

            // Progressive Overload Check
            const exercise = get().exercises.find(e => e.id === exerciseId);
            if (exercise && setNumber === exercise.sets) {
                let overload = false;
                if (exercise.tracking_type === 'reps' && exercise.max_reps && (data.reps || 0) >= exercise.max_reps) overload = true;
                if (exercise.tracking_type === 'time' && exercise.max_time && (data.time || 0) >= exercise.max_time) overload = true;

                if (overload && exercise.resistance_type === 'weight' && exercise.weight_increase_rate) {
                    const newWeight = (exercise.current_weight || 0) + exercise.weight_increase_rate;
                    // Update DB
                    await exerciseService.updateExercise(exerciseId, { current_weight: newWeight });
                    // Update local state
                    const newExercises = get().exercises.map(e => e.id === exerciseId ? { ...e, current_weight: newWeight } : e);
                    set({ exercises: newExercises });
                }
            }

        } catch (error) {
            console.error("Failed to log set", error);
        }
    },

    skipExercise: async (exerciseId) => {
        const { workoutLogId, exercisesStatus } = get();
        if (!workoutLogId) return;

        try {
            await workoutService.saveSetLog(workoutLogId, {
                exercise_id: exerciseId,
                set_number: 1,
                is_skipped: true
            });

            set({
                exercisesStatus: { ...exercisesStatus, [exerciseId]: { skipped: true } }
            });
        } catch (e) {
            console.error(e);
        }
    },

    finishWorkout: async () => {
        const { workoutLogId } = get();
        if (!workoutLogId) return;

        try {
            await workoutService.completeWorkout(workoutLogId, [], true);
            get().reset();
        } catch (e) {
            console.error(e);
        }
    },

    reset: () => set({
        isWorkoutActive: false,
        currentProgramId: null,
        currentDayId: null,
        workoutLogId: null,
        exercises: [],
        setsStatus: {},
        exercisesStatus: {}
    })
}));
