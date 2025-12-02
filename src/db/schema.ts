import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    muscle_group: text('muscle_group'), // e.g., 'chest', 'back', 'legs'
    equipment: text('equipment'), // e.g., 'barbell', 'dumbbell'
    video_url: text('video_url'),
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
    order_index: integer('order_index').notNull(),
    target_sets: integer('target_sets').default(3),
    target_reps: integer('target_reps').default(10),
    target_rpe: integer('target_rpe'),
    rest_time_seconds: integer('rest_time_seconds').default(60),
    min_reps: integer('min_reps').default(4),
    max_reps: integer('max_reps').default(12),
});

export const user_settings = sqliteTable('user_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    current_program_id: integer('current_program_id').references(() => programs.id),
    current_day_index: integer('current_day_index').default(0),
});

export const workout_logs = sqliteTable('workout_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    day_id: integer('day_id').references(() => days.id),
    completed_at: integer('completed_at', { mode: 'timestamp' }).default(new Date()),
    duration_seconds: integer('duration_seconds'),
});
