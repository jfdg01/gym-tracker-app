import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    variant: text('variant'),
    muscle_group: text('muscle_group'),
    equipment: text('equipment'),
    description: text('description'),
    photo_url: text('photo_url'),
    is_custom: integer('is_custom', { mode: 'boolean' }).default(false),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const programs = sqliteTable('programs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    schedule_sequence: text('schedule_sequence', { mode: 'json' }).notNull(), // JSON array
    is_active: integer('is_active', { mode: 'boolean' }).default(false),
});

export const program_days = sqliteTable('program_days', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    name: text('name').notNull(),
});

export const target_exercises = sqliteTable('target_exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    day_id: integer('day_id').references(() => program_days.id),
    exercise_id: integer('exercise_id').references(() => exercises.id),
    superset_id: integer('superset_id'),
    order: integer('order').notNull(),
    type: text('type').default('working'), // 'working', 'warmup', 'failure', 'drop'
    target_sets: integer('target_sets'),
    target_reps: integer('target_reps'),
    target_weight: real('target_weight'),
    rest_time: integer('rest_time'),
    notes: text('notes'),
});

export const sessions = sqliteTable('sessions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id),
    day_id: integer('day_id').references(() => program_days.id),
    started_at: integer('started_at', { mode: 'timestamp' }).notNull(),
    completed_at: integer('completed_at', { mode: 'timestamp' }),
});

export const performed_sets = sqliteTable('performed_sets', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    session_id: integer('session_id').references(() => sessions.id),
    exercise_id: integer('exercise_id').references(() => exercises.id),
    type: text('type').default('working'),
    set_number: integer('set_number').notNull(),
    reps: integer('reps').notNull(),
    weight: real('weight').notNull(),
    rpe: integer('rpe'),
    completed: integer('completed', { mode: 'boolean' }).default(false),
    timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const user_settings = sqliteTable('user_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    active_program_id: integer('active_program_id').references(() => programs.id),
    current_day_index: integer('current_day_index').default(0),
    language: text('language').default('en'),
    sound_enabled: integer('sound_enabled', { mode: 'boolean' }).default(true),
});
