# Live Workout & Progressive Overload Requirements

## 1. Overview
The "Live Workout" feature allows users to execute their scheduled workout for the day. It guides them through exercises, tracks their performance (reps, weight, time), and automatically applies progressive overload logic to increase difficulty for future sessions.

## 2. User Stories
*   **View Workout**: As a user, I want to see exactly what exercises I need to do today, including target sets, reps, and weight.
*   **Log Performance**: As a user, I want to simply input the reps (or time) I completed. The system should tell me what weight to use so I don't have to think about it.
*   **Auto-Progression**: As a user, I want the app to automatically increase the weight for an exercise next time if I successfully meet my rep targets today.

## 3. Functional Requirements

### 3.1. Workout Display
*   Display the current day's name and focus (e.g., "Push Day").
*   List exercises in the correct order (`order_index`).
*   For each exercise, show:
    *   Exercise Name.
    *   Target Sets.
    *   Target Reps (or Time).
    *   Target Weight (or Resistance).
    *   **Rest Timer**: Critical feature. Must be prominent and easy to use to reduce cognitive load. Idea

### 3.2. Performance Logging
*   **Input**: User logs **ONLY** the Reps (or Time) completed.
    *   **Weight**: Displayed as a read-only target. (System assumes user used the target weight unless explicitly overridden in a secondary menu, but primary flow is weight-free).
*   Support "Skipped" sets.
*   Default the input fields to the Target Reps for one-tap logging.

### 3.3. Progressive Overload Logic
*   **Trigger**: Upon finishing an exercise or completing the workout.
*   **Condition**:
    *   If the user completes **the last target set** with **actual reps >= target reps**.
*   **Action**:
    *   Update the `day_exercises` record for this exercise.
    *   New Target Weight = Current Target Weight + `increase_rate`.
*   **Feedback**: Notify the user that they "leveled up" or that the weight has increased for next time.

## 4. Technical Analysis & Schema Mapping

The existing schema in `src/db/schema.ts` fully supports these requirements.

| Requirement | Schema Field | Notes |
| :--- | :--- | :--- |
| **Target Reps** | `day_exercises.target_reps` | Acts as the threshold. |
| **Target Weight** | `day_exercises.target_weight` | The value to be updated. |
| **Increase Amount** | `day_exercises.increase_rate` | Amount to add (default 2.5). |
| **Logging** | `workout_exercise_sets` | Stores `actual_reps`, `actual_weight`. |
| **History** | `workout_logs` | Links sets to a completed session. |

### Schema Adjustments
*   **No immediate schema changes required.** The current schema is robust enough for the MVP of this feature.

## 5. UI/UX Guidelines (Design System)
*   **Aesthetic**: Dark Mode Premium (`bg-zinc-950`).
*   **Typography**: Large, clear numbers for inputs (`text-3xl` or `text-xl`).
*   **Input**: Large touch targets (`p-4`, `rounded-xl`).
*   **Colors**:
    *   Use `Blue-500` for primary actions (e.g., "Finish Set", "Complete Workout").
    *   Use `Emerald-500` for success states (e.g., hitting the target).
    *   Use `Zinc-800` for card backgrounds.

## 6. Architecture & Implementation
*   **Service Layer**: Logic for checking the threshold and updating `day_exercises` must reside in `src/services/WorkoutService.ts` (or `ExerciseService.ts`).
*   **State Management**: Use a local store or context to manage the "active workout" state before saving to DB.
*   **Safe Area**: Ensure the bottom action bar (if any) respects safe area insets.
