# Implementation Plan - Gym Tracker App

This document outlines the modular implementation plan for the Gym Tracker App, based on the requirements (`docs/reqs2.md`) and design system (`docs/design_system.md`).

## Phase 1: Core Architecture & Database Foundation
**Goal**: Establish the technical foundation, database schema, and navigation structure.

- [x] **Project Restructuring & Configuration**
    - [x] Create `src` directory structure.
    - [x] Configure Drizzle ORM and SQLite.
    - [x] Configure Tailwind CSS (NativeWind v4) with Design System colors.

- [x] **Database Implementation**
    - [x] Update `src/db/schema.ts` with the new data model.
    - [x] Generate migrations.
    - [x] Implement `src/db/client.ts`.
    - [x] Implement `src/db/seed.ts`.

- [x] **Navigation & Layout**
    - [x] Implement `src/navigation/RootNavigator.tsx` (Stack).
    - [x] Implement `src/navigation/TabNavigator.tsx`.
    - [x] Create `src/components/Layout.tsx`.

## Phase 2: Exercise Management (Req 1)
**Goal**: Allow users to manage their library of exercises.

- [x] **Exercise List Screen (`src/screens/ExercisesScreen.tsx`)**
    - [x] **Refactor**: Update UI to match "Dark Mode Premium" aesthetic.
    - [x] **Req 1.3**: Implement "Master List" view with Search and Filters.
    - [x] **Actions**: Add FAB for "Create Exercise".

- [x] **Exercise Details & Management**
    - [x] **Exercise Form Screen (`src/screens/ExerciseFormScreen.tsx`)**
        - [x] **Req 1.1**: Create/Edit form with fields: Name, Variant, Muscle Group, Equipment, Description, Photo.
        - [x] **Validation**: Ensure Name is required.
        - [x] **Logic**: Handle INSERT/UPDATE in `exercises` table.
    - [x] **Exercise Details Screen (`src/screens/ExerciseDetailsScreen.tsx`)**
        - [x] **Req 1.3**: Display exercise info.
        - [x] **Actions**: Edit (navigates to Form) and Delete (with confirmation).
        - [x] **History**: Show recent performance stats.

## Phase 3: Program Builder (Req 2)
**Goal**: Enable users to create and customize workout routines.

- [ ] **Program Management**
    - [ ] **Program List**: Display active/inactive programs (likely in Settings or a dedicated tab if needed, or part of Home). *Decision: Access via Profile/Settings or Home "Edit Program".*
    - [ ] **Program Builder Screen (`src/screens/ProgramBuilderScreen.tsx`)**
        - [ ] **Req 2.1**: Manage Days (Add/Edit/Delete Day).
        - [ ] **Schedule**: Define Weekly (Mon-Sun) or Periodic (Day A, Day B...) schedule.

- [ ] **Day Editor**
    - [ ] **Req 2.2**: Manage Exercises within a Day.
    - [ ] **Actions**: Add Exercise (from Catalog), Reorder, Remove.
    - [ ] **Targets**: Set target Sets, Reps, Weight, Rest for each exercise.

## Phase 4: Dashboard & Context (Req 3)
**Goal**: Provide immediate context on what to do today.

- [ ] **Home Screen (`src/screens/HomeScreen.tsx`)**
    - [ ] **Req 3.1**: Display "Context Cards":
        - [ ] **Last Session**: Summary of previous workout.
        - [ ] **Today's Session**: Main Call-to-Action ("Start Session").
        - [ ] **Next Session**: Preview of upcoming workout.
    - [ ] **Req 3.2**: Show list of exercises for Today's Session in the card.

## Phase 5: Workout Tracker (Req 6)
**Goal**: The active session experience.

- [ ] **Active Session Screen (`src/screens/ActiveSessionScreen.tsx`)**
    - [ ] **State Management**: Use Zustand for session state (timer, current set, etc.).
    - [ ] **Req 6.1**: Interface showing Target vs Actual.
    - [ ] **Timer**: Auto-start rest timer after set completion.
    - [ ] **Req 6.2**: "Skip Exercise" button.
    - [ ] **Req 6.4**: "Edit in Session" (modify targets on the fly).
    - [ ] **Req 6.5**: Input for Actual Reps/Weight.

## Phase 6: History & Progress (Req 4 & 5)
**Goal**: Visualize progress and plan future sessions.

- [ ] **History Screen (`src/screens/HistoryScreen.tsx`)**
    - [ ] **Req 4.3**: List of completed sessions.
    - [ ] **Charts**: Progress charts for key exercises.

- [ ] **Post-Workout Logic**
    - [ ] **Req 5.1**: "Next Session Planning" (Progress/Maintain).
    - [ ] **Req 5.2**: Add Notes for next time.

## Verification Plan

### Automated Tests
- Run `npx expo start` and verify no bundling errors.
- (Future) Add unit tests for `src/db` logic.

### Manual Verification
- **Design System**: Check `global.css` application on all screens.
- **Exercise Flow**:
    1. Go to Exercises Tab.
    2. Create a new Exercise "Test Press".
    3. Verify it appears in the list.
    4. Edit it to "Test Press Modified".
    5. Delete it.
- **Program Flow**:
    1. Create a Program "Test Split".
    2. Add "Day A".
    3. Add "Test Press" to "Day A".
- **Session Flow**:
    1. On Home, see "Day A" is scheduled (or manually start it).
    2. Start Session.
    3. Log a set.
    4. Verify Timer starts.
    5. Finish Session.
    6. Check History.
