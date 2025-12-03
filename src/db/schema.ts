import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

/*
represents the Exercise entity

1. When the user reaches the `max_reps`, the `weight` will be modified by the system using the `increase_rate`.
2. 


*/
export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    track_type: text('track_type').default('reps'), // 'reps' | 'time' // this is what the user counts
    resistance_type: text('resistance_type').default('weight'), // 'weight' | 'text' // this what makes it difficult
    sets: integer('sets').default(3),
    max_reps: integer('max_reps').default(12), // when above these reps, the weight will be modified by the system
    weight: integer('weight').default(20), // the weight will be modified by the system using the reps
    time_target: integer('time_target'), // target time in seconds for time-based exercises
    qualitative_progression: text('qualitative_progression'), // red band, legs on air, etc
    rest_time_seconds: integer('rest_time_seconds').default(180), // we should handle them minutes in the systems
    increase_rate: real('increase_rate').default(2.5), // how much the system increases the weight in kg
});

// represents the Program entity
export const programs = sqliteTable('programs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
});

// represents the Day entity, a composition of a program
export const days = sqliteTable('days', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    name: text('name').notNull(),
    is_rest_day: integer('is_rest_day', { mode: 'boolean' }).default(false),
    order_index: integer('order_index').notNull(),
});

// represents the DayExercise entity, a composition of a day and an exercise
export const day_exercises = sqliteTable('day_exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    day_id: integer('day_id').references(() => days.id),
    exercise_id: integer('exercise_id').references(() => exercises.id),
    order_index: integer('order_index').notNull()
});

// represents the UserSettings entity
export const user_settings = sqliteTable('user_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    current_program_id: integer('current_program_id').references(() => programs.id),
    last_day_id: integer('last_day_id').references(() => days.id), // this tracks the last day the user completed, independently of the date
    language: text('language').default('es'),
    name: text('name').default('User'),
});

// represents the WorkoutLog entity
export const workout_logs = sqliteTable('workout_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    day_id: integer('day_id').references(() => days.id),
    completed_at: integer('completed_at', { mode: 'timestamp' }).default(new Date()),
    duration_seconds: integer('duration_seconds'),
});