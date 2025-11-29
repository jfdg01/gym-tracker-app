# Data Model - Gym Tracker App (JSON)

This document defines the data structure for the application, implemented as a **Local JSON Store**.
The entire database is a single JSON object stored locally on the device.

## 1. Root Structure

The root JSON object contains the following top-level keys:

```json
{
  "settings": { ... },
  "exercises": [ ... ],
  "programs": [ ... ],
  "sessions": [ ... ]
}
```

## 2. Schema Definitions

### A. `exercises` (Catalog)
The master list of available exercises.

```typescript
type Exercise = {
  id: string;             // UUID
  name: string;           // e.g., "Bench Press"
  variant?: string;       // e.g., "Incline Dumbbell"
  muscle_group: string;   // e.g., "Chest"
  equipment?: string;     // e.g., "Barbell"
  description?: string;
  photo_url?: string;
  is_custom: boolean;
  created_at: number;     // Unix Timestamp
}
```

### B. `programs` (Routines)
Workout routines containing their schedule and day definitions.

```typescript
type Program = {
  id: string;             // UUID
  name: string;           // e.g., "PPL Split"
  is_active: boolean;
  
  // The rotation schedule. e.g., ["day_id_1", "day_id_2", "rest", "day_id_1"]
  schedule_sequence: string[]; 
  
  days: ProgramDay[];
}

type ProgramDay = {
  id: string;             // UUID
  name: string;           // e.g., "Push Day"
  exercises: TargetExercise[];
}

type TargetExercise = {
  id: string;             // UUID
  exercise_id: string;    // Reference to exercises.id
  superset_id?: string;   // Grouping ID
  order: number;
  type: 'working' | 'warmup' | 'failure' | 'drop';
  target_sets: number;
  target_reps: number;
  target_weight: number;
  rest_time: number;      // Seconds
  notes?: string;
}
```

### C. `sessions` (History)
Records of completed or in-progress workouts.

```typescript
type Session = {
  id: string;             // UUID
  program_id: string;     // Reference to programs.id (Snapshot)
  day_id: string;         // Reference to programs.days.id (Snapshot)
  day_label: string;      // Name of the day at time of session (Snapshot)
  started_at: number;     // Unix Timestamp
  completed_at?: number;  // Unix Timestamp (null if active)
  
  sets: PerformedSet[];
}

type PerformedSet = {
  id: string;             // UUID
  exercise_id: string;    // Reference to exercises.id
  type: 'working' | 'warmup' | 'failure' | 'drop';
  set_number: number;
  reps: number;
  weight: number;
  rpe?: number;           // 1-10
  completed: boolean;
  timestamp: number;
}
```

### D. `settings` (App State)
Global user preferences.

```typescript
type Settings = {
  active_program_id?: string; // Reference to programs.id
  current_day_index: number;  // Index in active_program.schedule_sequence
  language: string;           // 'en', 'es'
  sound_enabled: boolean;
}
```

## 3. Key Design Decisions

*   **Single File Store**: Data is stored in a single JSON file for simplicity and portability.
*   **UUIDs**: Using UUIDs instead of auto-incrementing integers for easier synchronization and collision avoidance if we ever sync.
*   **Nested Structure**: `days` and `target_exercises` are nested within `programs` because they don't exist independently. `sets` are nested within `sessions`.
*   **References**: `exercises` are kept flat to allow reuse across programs and sessions.
