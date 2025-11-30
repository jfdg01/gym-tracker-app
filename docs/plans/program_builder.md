# Program Builder Implementation Plan

This subplan focuses on Phase 3: Program Builder (Req 2).
The goal is to allow users to define their workout structure and set initial targets for progressive overload.

## Goals
1.  **Program Management**: Create/Edit programs (e.g., "PPL Split", "Upper/Lower").
2.  **Day Management**: Define days within a program (e.g., "Push A", "Pull B").
3.  **Exercise Assignment**: Add exercises to days and set *initial targets* (Sets, Reps, Weight, Rest).
4.  **Scheduling**: Define how days map to the calendar (Weekly vs Periodic).

## Components & Screens

### 1. Program List (Entry Point)
-   **Location**: Accessible via a "Programs" tab or a "Manage Program" button on Home. *Decision: Add a "Programs" button to the Home Screen header or a dedicated Settings section. Let's put it in the "Settings" tab for now to avoid clutter, or a small "Edit" icon next to the current program on Home.*
-   **UI**: List of programs. Active program highlighted.
-   **Actions**: "Create New Program", "Select Active Program", "Edit Program".

### 2. Program Builder Screen (`src/screens/ProgramBuilderScreen.tsx`)
-   **UI**:
    -   **Header**: Program Name Input.
    -   **Schedule Type**: Segmented Control (Weekly vs Periodic).
    -   **Days List**: Horizontal or Vertical list of days.
    -   **Add Day Button**: Adds a new day (e.g., "Day 1").
-   **Logic**:
    -   **Weekly**: 7 slots (Mon-Sun). User assigns a "Day" to each slot.
    -   **Periodic**: Ordered list of Days. User defines the sequence (A, B, Rest, C...).

### 3. Day Editor Screen (`src/screens/DayEditorScreen.tsx`)
-   **UI**:
    -   **Header**: Day Name (e.g., "Push A").
    -   **Exercise List**: Draggable list of exercises assigned to this day.
    -   **Add Exercise FAB**: Opens a picker (reusing `ExercisesScreen` in selection mode).
    -   **Exercise Card**:
        -   Shows Name.
        -   **Inputs**: Target Sets, Target Reps, Target Weight (optional), Rest Time.
        -   **Remove Button**.
-   **Logic**:
    -   Save changes to `program_days` and `target_exercises` tables.
    -   Ensure "Target Weight" can be set to 0 or left blank if RPE is used.

## Data Model Changes
-   Verify `programs`, `program_days`, and `target_exercises` tables support the requirements.
-   `programs.schedule_sequence`: JSON array storing the order (e.g., `["day_id_1", "rest", "day_id_2"]`).

## Execution Steps

1.  **Program List**: Implement a simple list in Settings or Home to manage programs.
2.  **Program Builder**: Implement the screen to create a program and add days.
3.  **Day Editor**: Implement the screen to add exercises to a day and configure targets.
4.  **Exercise Picker**: Adapt `ExercisesScreen` to return a selected exercise ID.
5.  **Integration**: Ensure the "Active Program" can be selected and affects the Home Screen context.

## Key Considerations for "Overloading"
-   The targets set here are the *baseline*.
-   The "Session" feature (Phase 5) will read these targets.
-   Post-workout (Phase 6), the user will update these targets for the *next* session.
-   Therefore, this builder is crucial for setting the *initial* state.
