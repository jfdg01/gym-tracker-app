// Re-export all service functions
export * from './entities/exercises';
export * from './entities/plans';
export * from './entities/userSettings';
export * from './workoutLogs';

// Re-export all types for convenience
export type { Exercise, NewExercise } from './entities/exercises';
export type { Plan, Day, DayExercise, NewPlan, NewDay, NewDayExercise } from './entities/plans';
export type { UserSettings, NewUserSettings } from './entities/userSettings';
export type { WorkoutLog, NewWorkoutLog, WorkoutLogFilters, WorkoutStats } from './workoutLogs';

// DO NOT export: db, expoDb, or schema
// These are internal implementation details and should only be used by service modules
// Screens and components should only use the exported service functions above
