# Technical Design: Live Workout Feature

## 1. Architecture Overview

This feature adheres to the project's **Domain-Driven Design (DDD)** principles. The logic is encapsulated in the **Service Layer**, while the UI focuses on presentation and user interaction.

### High-Level Data Flow
1.  **Initialization**: `LiveWorkoutScreen` requests `WorkoutService` to initialize a session for a specific `Day`.
2.  **State**: The active workout state (current exercise, input values, timer) is managed via a local **Zustand Store** (`useLiveWorkoutStore`) to ensure responsive UI updates without constant DB writes for every keystroke.
3.  **Persistence**: Completed sets are persisted to the DB via `WorkoutService.logSet()` immediately upon completion (to prevent data loss).
4.  **Completion**: `WorkoutService.completeWorkout()` finalizes the log and triggers the **Progressive Overload** calculation.

## 2. Component Structure

### 2.1. Screen: `LiveWorkoutScreen` (`app/workout/[id].tsx`)
*   **Responsibility**: Orchestrates the workout flow.
*   **Layout**:
    *   `SafeAreaView` (via `useSafeAreaInsets`).
    *   `WorkoutHeader`: Shows Day Name and "Finish" button.
    *   `ExerciseList`: Vertical scrollable list of exercises.
    *   `ActiveExerciseView`: A focused view for the current exercise (if we go with a focused mode) OR the list itself expands the active card. *Decision: Expandable Cards for better context.*
    *   `RestTimerOverlay`: Floating or fixed bottom sheet when timer is active.

### 2.2. Components (`src/components/workout/`)
*   **`ExerciseCard.tsx`**:
    *   Displays Exercise Name, Target Sets/Reps.
    *   Contains the list of `SetInputRow`s.
*   **`SetInputRow.tsx`**:
    *   **Props**: `setNumber`, `targetReps`, `targetWeight`, `isCompleted`.
    *   **UI**:
        *   Left: Set Indicator (e.g., "1").
        *   Center: `Target Weight` (Read-only text).
        *   Right: `Reps Input` (Large numeric input).
        *   Action: Checkbox/Button to "Complete Set".
*   **`RestTimer.tsx`**:
    *   **Props**: `duration`, `onComplete`, `onAddSeconds`.
    *   **UI**: Circular progress AND simple digital countdown.

## 3. State Management (`src/stores/useLiveWorkoutStore.ts`)

We will use a transient Zustand store for the active session.

```typescript
interface LiveWorkoutState {
  // Session Data
  workoutLogId: number | null;
  activeExerciseId: number | null;
  
  // Timer
  isTimerRunning: boolean;
  timerSecondsRemaining: number;
  
  // Actions
  startWorkout: (dayId: number) => Promise<void>;
  setActiveExercise: (id: number) => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
}
```

## 4. Service Layer (`src/services/WorkoutService.ts`)

### New Methods

#### `initializeWorkout(dayId: number): Promise<WorkoutLog>`
*   Creates a new `workout_logs` entry.
*   Returns the log with associated `day` and `program` info.

#### `logSet(set: NewWorkoutSet): Promise<void>`
*   Persists the set to `workout_exercise_sets`.
*   *Optimization*: Can be fire-and-forget from the UI perspective, but should handle errors.

#### `completeWorkout(logId: number): Promise<void>`
*   **Transaction**:
    1.  Mark `workout_logs.completed_at`.
    2.  **Progressive Overload Check**:
        *   Iterate through all exercises in the workout.
        *   Fetch all sets for each exercise.
        *   **Rule**: If `last_set.actual_reps >= target_reps`, trigger increase.
        *   **Update**: `day_exercises.target_weight += increase_rate`.

## 5. Workout Progression & Scheduling

### 5.1. Sequential Logic (Date Agnostic)
*   **Tracking**: The system tracks `user_settings.last_day_id`.
*   **Next Workout**: The "Active" workout is always the *next sequential day* after `last_day_id` in the current program.
    *   *Example*: If User finishes Day 1, Day 2 becomes the "Next Workout", regardless of whether it's tomorrow or 2 weeks from now.
*   **Looping**: If the last day of the program is completed, the cycle restarts at Day 1.

### 5.2. UI Behavior ("Soft Guidance")
*   **Completed Days**: Visually marked (e.g., Green Check, Dimmed).
*   **Next Day**: Highlighted as "Up Next".
*   **Future Days**: Accessible but not highlighted.
*   **Confirmation**: If a user tries to start a workout that is *not* the "Next Day" (e.g., skipping ahead), show a confirmation dialog:
    *   *"You are scheduled for [Day Name]. Do you want to do [Selected Day] instead?"*

## 6. UI/UX & Design System Integration

*   **Colors**:
    *   Background: `bg-zinc-950`
    *   Active Card: `bg-zinc-900` with `border-blue-500`
    *   Inactive Card: `bg-zinc-900/50`
    *   Timer: `text-blue-500` (Active), `text-emerald-500` (Done)
*   **Typography**:
    *   Reps Input: `text-3xl font-bold text-white` (Focus on the number).
    *   Target Weight: `text-sm text-zinc-400` (Secondary info).

## 6. Error Handling & Edge Cases
*   **Crash Recovery**: Since sets are persisted immediately, re-opening the app should check for an "In Progress" workout (latest log without `completed_at`) and resume it.
*   **Offline**: SQLite is local, so offline is native.
