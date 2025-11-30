# Workout Tracking Implementation Plan

This subplan focuses on Phase 5: Workout Tracker (Req 6).
The goal is to provide a seamless, focused experience for the user while they are training.

## Goals
1.  **Session State Management**: Robust handling of the active workout (Timer, Sets, Current Exercise).
2.  **The "Player" UI**: A distraction-free interface to log sets and manage rest.
3.  **Data Integrity**: Accurate recording of what was actually done vs what was planned.
4.  **Flow Control**: Smooth transitions between sets and exercises.

## Components & Screens

### 1. Session Store (`src/store/useSessionStore.ts`)
-   **Library**: `zustand` (lightweight state management).
-   **State**:
    -   `status`: 'idle' | 'active' | 'resting' | 'paused' | 'finished'
    -   `sessionId`: ID of the current session in DB.
    -   `exercises`: Array of exercises for this session (snapshot).
    -   `currentExerciseIndex`: Index of the active exercise.
    -   `currentSetIndex`: Index of the active set.
    -   `timer`: { `secondsRemaining`: number, `isActive`: boolean, `initialDuration`: number }
-   **Actions**:
    -   `startSession(programId, dayId)`: Initializes state, creates DB entry.
    -   `logSet(reps, weight, rpe)`: Updates local state, writes to `performed_sets`.
    -   `startRest(duration)`: Starts the timer.
    -   `skipExercise()`: Moves to next exercise.
    -   `finishSession()`: Updates `sessions` table, clears state.

### 2. Active Session Screen (`src/screens/ActiveSessionScreen.tsx`)
-   **UI Layout**:
    -   **Header**: Timer (Large, prominent when resting), Exercise Name.
    -   **Current Set Card**:
        -   **Target**: "Goal: 12 reps @ 60kg"
        -   **Input**: Large inputs for **Reps** and **Weight** (pre-filled with target).
        -   **Action**: Big "Complete Set" button.
    -   **Session Progress**: "Exercise 2 of 5", "Set 1 of 3".
    -   **History List**: Scrollable list of sets already completed for this exercise.
    -   **Controls**:
        -   "Skip Exercise" (Secondary action).
        -   "Edit Target" (Req 6.4) - Opens a modal to adjust remaining sets.
        -   "Mute Timer" (Toggle).

### 3. Rest Timer Overlay
-   **Behavior**: When a set is completed, the screen shifts focus to the timer.
-   **Audio**: Play a sound when timer hits 0 (using `expo-av`).
-   **Controls**: "+30s", "-10s", "Skip Rest".

## Data Flow
1.  **Start**: User clicks "Start Session" on Home.
2.  **Init**: Fetch `target_exercises` for the day. Create `sessions` row.
3.  **Loop**:
    -   User inputs actuals.
    -   User clicks "Complete".
    -   App saves to `performed_sets`.
    -   App starts Rest Timer.
    -   App advances `currentSetIndex`.
    -   If sets done -> Advance `currentExerciseIndex`.
4.  **End**: User clicks "Finish". App updates `sessions.completed_at`. Navigate to Summary.

## Key Questions / Assumptions
-   **Supersets**: For this MVP, we will treat all exercises as sequential. `superset_id` will be ignored in the UI flow for now.
-   **Audio**: We will use `expo-av` for simple beep sounds.
-   **Background**: We will use a simple timestamp diff for the timer to ensure accuracy even if the app is backgrounded, though we won't implement full background tasks (headless JS) unless strictly necessary for the alarm.

## Execution Steps
1.  **Store**: Implement `useSessionStore` with Zustand.
2.  **Screen Skeleton**: Build the basic UI layout.
3.  **Logic Integration**: Connect the "Complete Set" button to the store and DB.
4.  **Timer**: Implement the countdown logic and sound.
5.  **Navigation**: Connect Home -> Session -> Summary.
