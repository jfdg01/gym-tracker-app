import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type').default('reps'), // 'reps' | 'time' | 'text'
    sets: integer('sets').default(3),
    max_reps: integer('max_reps').default(12),
    min_reps: integer('min_reps').default(4),
    weight: integer('weight').default(20), // the weight will be modified by the system using the reps
    time_duration: integer('time_duration'), // target time in seconds for time-based exercises
    current_val_text: text('current_val_text'), // current value for text-based exercises
    rest_time_seconds: integer('rest_time_seconds').default(180),
    increase_rate: real('increase_rate').default(2.5),
    decrease_rate: real('decrease_rate').default(5.0),
    time_increase_step: integer('time_increase_step').default(5),
    max_time_cap: integer('max_time_cap').default(120),
});

export const programs = sqliteTable('programs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
});

export const days = sqliteTable('days', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    name: text('name').notNull(),
    is_rest_day: integer('is_rest_day', { mode: 'boolean' }).default(false),
    order_index: integer('order_index').notNull(),
});

export const day_exercises = sqliteTable('day_exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    day_id: integer('day_id').references(() => days.id),
    exercise_id: integer('exercise_id').references(() => exercises.id),
    order_index: integer('order_index').notNull()
});

export const user_settings = sqliteTable('user_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    current_program_id: integer('current_program_id').references(() => programs.id),
    current_day_index: integer('current_day_index').default(0),
    language: text('language').default('en'),
    name: text('name').default('User'),
});

export const workout_logs = sqliteTable('workout_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    day_id: integer('day_id').references(() => days.id),
    completed_at: integer('completed_at', { mode: 'timestamp' }).default(new Date()),
    duration_seconds: integer('duration_seconds'),
});
