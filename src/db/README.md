# Database Service Layer

This directory contains the database service layer that provides a clean, type-safe interface for interacting with the app's SQLite database.

## Architecture

```txt
src/db/
├── client.ts          # Database connection (internal)
├── schema.ts          # Database schema definitions (internal)
├── exercises.ts       # Exercise CRUD operations
├── plans.ts           # Program/day/exercise management
├── userSettings.ts    # User settings operations
├── workoutLogs.ts     # Workout history & analytics
└── index.ts           # Public API exports
```

## Usage

### ✅ Correct - Import from the service layer

```typescript
import { 
  getUserSettings, 
  updateName,
  createWorkoutLog,
  getAllExercises,
  type UserSettings,
  type Exercise
} from '../db';
```

### ❌ Incorrect - Do not import directly from client or schema

```typescript
// Don't do this!
import { db } from '../db/client';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
```

## Available Services

### User Settings (`userSettings.ts`)

```typescript
// Get settings (creates if missing)
const settings = await getUserSettings();

// Update settings
await updateUserSettings({ name: 'John', language: 'es' });

// Convenience methods
await updateName('John');
await updateLanguage('es');
await updateCurrentProgram(programId);
await updateCurrentDayIndex(0);
```

### Workout Logs (`workoutLogs.ts`)

```typescript
// Log a workout
const log = await createWorkoutLog({
  program_id: 1,
  day_id: 1,
  duration_seconds: 3600,
  completed_at: new Date()
});

// Get recent workouts
const recent = await getRecentWorkoutLogs(10);

// Get workouts with filters
const filtered = await getWorkoutLogs({
  programId: 1,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

// Get statistics
const stats = await getWorkoutStats(programId);
```

### Exercises (`exercises.ts`)

```typescript
const exercises = await getAllExercises();
const exercise = await getExerciseById(1);
const created = await createExercise({ name: 'Push-up', sets: 3 });
await updateExercise(1, { sets: 4 });
await deleteExercise(1);
```

### Plans (`plans.ts`)

```typescript
const plans = await getPlans();
const plan = await getPlanDetails(1);
const planId = await createPlan('My Program');
await updatePlan(1, { name: 'Updated Name' });
await deletePlan(1);

// Days
const dayId = await addDayToPlan(planId, 'Day 1');
await updateDay(dayId, { name: 'Push Day' });
await deleteDay(dayId);
await reorderDays(planId, [3, 1, 2]);

// Day Exercises
const id = await addExerciseToDay(dayId, exerciseId);
await removeExerciseFromDay(id);
await replaceExerciseInDay(id, newExerciseId);
await reorderExercisesInDay(dayId, [2, 1, 3]);
```

## Benefits

✅ **Complete Abstraction** - No direct database or ORM access needed  
✅ **Type Safety** - Full TypeScript support with inferred types  
✅ **Easy Testing** - Service functions are easy to mock  
✅ **Future-Proof** - Database can be swapped without touching screens  
✅ **Clean Code** - No boilerplate, clear intent  

## Migration Guide

When updating old code that uses direct database access:

1. Remove imports of `db`, `schema`, and Drizzle operators (`eq`, `desc`, etc.)
2. Import service functions from `'../db'`
3. Replace direct queries with service function calls
4. Remove existence checks for `user_settings` (service handles it)

See the [walkthrough](file:///home/gara/.gemini/antigravity/brain/fac5ef69-9f03-4602-a96f-3aa54bf99b61/walkthrough.md) for detailed before/after examples.
