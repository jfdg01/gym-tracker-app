# Implementation Plan - Gym Tracker App

This document outlines the modular implementation plan for the Gym Tracker App, based on the requirements (`docs/reqs2.md`), data model (`docs/data_model.md`), and tech stack (`docs/tech_stack.md`).

## Phase 1: Core Architecture & Database Foundation
**Goal**: Establish the technical foundation, database schema, and navigation structure, aligning with the `App.tsx` structure.

- [x] **Project Restructuring & Configuration**
    - [x] Create `src` directory structure (`src/db`, `src/screens`, `src/components`, `src/i18n`).
    - [x] Move existing `db/` contents to `src/db/` and rename to `.ts` for TypeScript.
    - [x] **Install `drizzle-kit`** (dev dependency) and `babel-plugin-inline-import`.
    - [x] **Configure `drizzle.config.ts`**: Create this file with `driver: 'expo'` and `dialect: 'sqlite'` (Standard practice).
    - [x] **Update `babel.config.js`**: Add `babel-plugin-inline-import` to support importing `.sql` migration files (Required for Expo + Drizzle).
    - [x] **Update `metro.config.js`**: Add `sql` to `resolver.sourceExts` to allow bundling migration files.
    - [x] **Install & Configure Tailwind CSS (NativeWind v4)**: Dependencies installed, `tailwind.config.js` created, `global.css` added, `babel.config.js` updated.

- [x] **Database Implementation**
    - [x] Update `src/db/schema.ts` with the new data model (Exercises, Programs, Sessions, etc.).
    - [x] Generate migrations using `drizzle-kit generate` (creates `drizzle/migrations`).
    - [x] Implement `src/db/client.ts` (adapting existing `db/index.js` logic).
    - [x] Implement `src/db/seed.ts` to populate initial exercises.

- [x] **Navigation & Layout**
    - [x] Implement `src/navigation/RootNavigator.tsx` (Stack).
    - [x] Implement `src/navigation/TabNavigator.tsx` (Home, Exercises, History, Settings).
    - [x] Create `src/components/Layout.tsx` (SafeArea, StatusBar).
    - [x] Integrate Navigation into `App.tsx`.

## Phase 2: Exercise Catalog (Feature)
**Goal**: Allow users to manage their library of exercises.

- [x] **Exercise List Screen**
    - [x] Implement `FlashList` for performance.
    - [x] Add Search Bar (filter by name).
    - [x] Add Filters (Muscle Group, Equipment).
    - [x] Implement "Add Exercise" FAB.

- [ ] **Exercise Details & Management**
    - [ ] Create "Create/Edit Exercise" Form (Name, Variant, Muscle, Equipment, Notes).
    - [ ] Implement Delete functionality.
    - [ ] View Exercise History/Stats on details page.

## Phase 3: Program Builder (Feature)
**Goal**: Enable users to create and customize workout routines.

- [ ] **Program Management**
    - [ ] Program List Screen (Active vs Inactive).
    - [ ] Program Editor (Name, Schedule Type: Weekly vs Periodic).

- [ ] **Day & Routine Editor**
    - [ ] Day Editor Screen (Name, List of Exercises).
    - [ ] "Add Exercise to Day" flow (select from Catalog).
    - [ ] Configure Target Sets/Reps/Weight for each exercise.
    - [ ] Reorder exercises (Drag & Drop or Up/Down buttons).

## Phase 4: Dashboard & Context (Feature)
**Goal**: Provide immediate context on what to do today.

- [ ] **Home Screen (Dashboard)**
    - [ ] "Current Status" Card: Show today's assigned workout (or "Rest Day").
    - [ ] "Quick Actions": Start Workout button.
    - [ ] "Schedule Preview": Show previous and next sessions.
    - [ ] "Daily Summary": List exercises for today.

## Phase 5: Workout Tracker (Core Feature)
**Goal**: The active session experience ("The Player").

- [ ] **Session Logic (Zustand)**
    - [ ] Create `useSessionStore` to manage active workout state (current exercise, set, timer).
    - [ ] Implement State Machine: `Idle` -> `WorkoutInProgress` -> `Resting` -> `Finished`.

- [ ] **Active Session Screen**
    - [ ] Header: Timer, Current Exercise Name.
    - [ ] Set List: Render sets for current exercise (Previous stats vs Target).
    - [ ] Input Fields: Reps, Weight, RPE.
    - [ ] "Complete Set" Action: Triggers Rest Timer.
    - [ ] "Rest Timer" Overlay/Component (Background Timer integration).
    - [ ] "Next Exercise" / "Finish Workout" navigation.

- [ ] **Post-Workout**
    - [ ] "Session Summary" Screen.
    - [ ] Update "Next Day" logic in User Settings.

## Phase 6: History & Analytics (Feature)
**Goal**: Visualize progress.

- [ ] **History Screen**
    - [ ] Calendar View or List View of completed sessions.
    - [ ] Session Detail View (drill down into sets).

- [ ] **Analytics**
    - [ ] Implement `Victory Native XL` charts.
    - [ ] Volume/1RM progress over time for specific exercises.

## Phase 7: Polish & Settings
**Goal**: User preferences and app quality.

- [ ] **User Settings**
    - [ ] Theme Toggle (Dark/Light).
    - [ ] Sound Settings (Timer mute).
    - [ ] Language Selector.
    - [ ] Data Management (Export DB to file).

- [ ] **Final Polish**
    - [ ] UI Consistency check (Spacing, Typography).
    - [ ] Empty States for all lists.
    - [ ] Loading States & Error Boundaries.
