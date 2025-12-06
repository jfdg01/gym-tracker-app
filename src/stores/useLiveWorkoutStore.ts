import { create } from 'zustand';

interface LiveWorkoutState {
    // Session Data
    workoutLogId: number | null;
    activeExerciseId: number | null;

    // Timer
    isTimerRunning: boolean;
    timerSecondsRemaining: number;
    timerDuration: number; // The initial duration set

    // Actions
    setWorkoutLogId: (id: number | null) => void;
    setActiveExercise: (id: number | null) => void;

    startRestTimer: (duration: number) => void;
    stopRestTimer: () => void;
    tickTimer: () => void; // Call this every second from a component or interval
    reset: () => void;
}

export const useLiveWorkoutStore = create<LiveWorkoutState>((set) => ({
    workoutLogId: null,
    activeExerciseId: null,

    isTimerRunning: false,
    timerSecondsRemaining: 0,
    timerDuration: 0,

    setWorkoutLogId: (id) => set({ workoutLogId: id }),
    setActiveExercise: (id) => set({ activeExerciseId: id }),

    startRestTimer: (duration) => set({
        isTimerRunning: true,
        timerSecondsRemaining: duration,
        timerDuration: duration
    }),

    stopRestTimer: () => set({
        isTimerRunning: false,
        timerSecondsRemaining: 0
    }),

    tickTimer: () => set((state) => {
        if (!state.isTimerRunning) return {};
        if (state.timerSecondsRemaining <= 0) {
            return { isTimerRunning: false, timerSecondsRemaining: 0 };
        }
        return { timerSecondsRemaining: state.timerSecondsRemaining - 1 };
    }),

    reset: () => set({
        workoutLogId: null,
        activeExerciseId: null,
        isTimerRunning: false,
        timerSecondsRemaining: 0,
        timerDuration: 0
    })
}));
