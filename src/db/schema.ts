import { sqliteTable, integer, text, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// represents the Exercise entity (template/definition only, not instance-specific values)
export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    track_type: text('track_type', { enum: ['reps', 'time'] }).notNull().default('reps'), // what the user counts
    resistance_type: text('resistance_type', { enum: ['weight', 'text'] }).notNull().default('weight'), // what makes it difficult
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
});

// represents the Program entity
export const programs = sqliteTable('programs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
});

// represents the Day entity, a composition of a program
export const days = sqliteTable('days', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id')
        .notNull()
        .references(() => programs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    is_rest_day: integer('is_rest_day', { mode: 'boolean' }).notNull().default(false),
    order_index: integer('order_index').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => ({
    // Ensure unique order_index per program
    uniqueOrderPerProgram: uniqueIndex('days_program_order_idx').on(table.program_id, table.order_index),
}));

// represents the DayExercise entity, links exercises to days with instance-specific values
export const day_exercises = sqliteTable('day_exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    day_id: integer('day_id')
        .notNull()
        .references(() => days.id, { onDelete: 'cascade' }),
    exercise_id: integer('exercise_id')
        .notNull()
        .references(() => exercises.id, { onDelete: 'cascade' }),
    order_index: integer('order_index').notNull(),

    // Instance-specific exercise configuration (moved from exercises table)
    target_sets: integer('target_sets').notNull().default(3),
    target_reps: integer('target_reps').notNull().default(12), // max reps before weight increase
    target_weight: real('target_weight').default(20), // in kg
    target_resistance_text: text('target_resistance_text'), // for text-based resistance (e.g. bands)
    target_time_seconds: integer('target_time_seconds'), // for time-based exercises
    rest_time_seconds: integer('rest_time_seconds').notNull().default(180), // 3 minutes
    increase_rate: real('increase_rate').notNull().default(2.5), // how much to increase weight
}, (table) => ({
    dayIdIdx: index('day_exercises_day_idx').on(table.day_id),
    exerciseIdIdx: index('day_exercises_exercise_idx').on(table.exercise_id),
}));

// represents the UserSettings entity (singleton)
export const user_settings = sqliteTable('user_settings', {
    id: integer('id').primaryKey().$defaultFn(() => 1), // Enforce singleton with fixed ID
    current_program_id: integer('current_program_id').references(() => programs.id, { onDelete: 'set null' }),
    last_day_id: integer('last_day_id').references(() => days.id, { onDelete: 'set null' }), // tracks last completed day
    language: text('language').notNull().default('es'),
    name: text('name').notNull().default('User'),
});

// represents the WorkoutLog entity (one per completed workout session)
export const workout_logs = sqliteTable('workout_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    program_id: integer('program_id').references(() => programs.id, { onDelete: 'set null' }),
    day_id: integer('day_id').references(() => days.id, { onDelete: 'set null' }),
    completed_at: integer('completed_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    duration_seconds: integer('duration_seconds'),
});

// represents individual set performance within a workout
export const workout_exercise_sets = sqliteTable('workout_exercise_sets', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workout_log_id: integer('workout_log_id')
        .notNull()
        .references(() => workout_logs.id, { onDelete: 'cascade' }),
    exercise_id: integer('exercise_id')
        .notNull()
        .references(() => exercises.id),
    day_exercise_id: integer('day_exercise_id')
        .references(() => day_exercises.id, { onDelete: 'set null' }), // link to specific day exercise config
    set_number: integer('set_number').notNull(), // 1, 2, 3...

    // Actual values achieved during the workout
    actual_reps: integer('actual_reps'),
    actual_weight: real('actual_weight'),
    actual_time_seconds: integer('actual_time_seconds'),
    actual_resistance_text: text('actual_resistance_text'),

    // Target values at the time of workout (snapshot from day_exercises)
    target_reps: integer('target_reps'),
    target_weight: real('target_weight'),
    target_time_seconds: integer('target_time_seconds'),

    skipped: integer('skipped', { mode: 'boolean' }).notNull().default(false),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
    workoutLogIdx: index('workout_sets_log_idx').on(table.workout_log_id),
    exerciseIdx: index('workout_sets_exercise_idx').on(table.exercise_id),
}));