import { days } from '../db/schema';

export type ViewState = 'LIST' | 'PROGRAM_EDIT' | 'DAY_EDIT';

export type ProgramItem = {
    id: number;
    name: string;
    description: string | null;
};

export type DayItem = typeof days.$inferSelect;

export type DayExerciseItem = {
    id: number; // day_exercise id
    exercise_id: number;
    name: string;
    sets: number;
    reps: number;
    order_index: number;
};
