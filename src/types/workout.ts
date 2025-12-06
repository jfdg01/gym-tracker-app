// Type definitions for workout components

export interface WorkoutSet {
    id?: number;
    workout_log_id: number;
    exercise_id: number;
    day_exercise_id: number | null;
    set_number: number;
    actual_reps: number | null;
    actual_weight: number | null;
    actual_time_seconds: number | null;
    actual_resistance_text: string | null;
    target_reps: number | null;
    target_weight: number | null;
    target_time_seconds: number | null;
    skipped: boolean;
    created_at?: Date;
}

export interface DayExerciseWithDetails {
    id: number;
    day_id: number;
    exercise_id: number;
    order_index: number;
    target_sets: number;
    target_reps: number;
    target_weight: number | null;
    increase_rate: number;
    rest_time_seconds: number;
    name: string;
    description: string | null;
}

// Component prop interfaces

export interface ExerciseCardProps {
    exerciseName: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    sets: WorkoutSet[];
    onLogSet: (setNumber: number, reps: number, weight: number) => void;
}

export interface RestTimerProps {
    onAddSeconds: (seconds: number) => void;
    onSkip: () => void;
}

export interface SetInputRowProps {
    setNumber: number;
    targetReps: number;
    targetWeight: number;
    isCompleted: boolean;
    actualReps?: number;
    onComplete: (reps: number) => void;
    onUpdateReps?: (reps: number) => void;
}
