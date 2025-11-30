# Exercise Management Implementation Plan

This subplan focuses on delivering the Exercise Management feature set (Req 1).

## Goals
1.  **Master List**: A searchable, filterable list of all exercises (Req 1.3).
2.  **Create/Edit**: A form to add new exercises or modify existing ones (Req 1.1).
3.  **Details**: A view to see exercise details and history (Req 1.3).

## Components & Screens

### 1. Exercise List Screen (`src/screens/ExercisesScreen.tsx`)
-   **UI**:
    -   Use `FlashList` for performance.
    -   **Search Bar**: Top sticky header, real-time filtering.
    -   **Filter Chips**: Horizontal scroll for "Muscle Group" (Chest, Back, Legs...) and "Equipment".
    -   **List Item**: Card with Name, Variant (subtitle), and Muscle Group (badge).
    -   **FAB**: Floating Action Button (+) to navigate to `ExerciseFormScreen`.
-   **Data**:
    -   Fetch all exercises from DB (`useLiveQuery` or `useFocusEffect` with `db.query`).

### 2. Exercise Form Screen (`src/screens/ExerciseFormScreen.tsx`)
-   **UI**:
    -   **Header**: "Create Exercise" or "Edit Exercise".
    -   **Fields**:
        -   Name (TextInput, required).
        -   Variant (TextInput, optional, e.g., "Incline").
        -   Muscle Group (Select/Dropdown).
        -   Equipment (Select/Dropdown).
        -   Description (Multiline TextInput).
    -   **Button**: "Save Exercise" (Primary).
-   **Logic**:
    -   Validate `name` is not empty.
    -   If `id` is passed, update existing record.
    -   If no `id`, insert new record.

### 3. Exercise Details Screen (`src/screens/ExerciseDetailsScreen.tsx`)
-   **UI**:
    -   **Header**: Exercise Name & Variant.
    -   **Info Cards**: Muscle, Equipment, Description.
    -   **History Section**: List of recent sets (placeholder for now until Session feature is built).
    -   **Actions**:
        -   "Edit" (Icon in header).
        -   "Delete" (Icon in header or button at bottom, red).
-   **Logic**:
    -   Fetch details by `id`.
    -   Delete confirmation alert.

## Execution Steps

1.  **Database & Types**: Verify `exercises` table schema matches requirements.
2.  **List Screen**: Implement the UI and Search/Filter logic.
3.  **Form Screen**: Implement the Input fields and Save logic.
4.  **Details Screen**: Implement the View and Delete logic.
5.  **Integration**: Ensure navigation flows correctly (List -> Details -> Edit -> Save -> List).
