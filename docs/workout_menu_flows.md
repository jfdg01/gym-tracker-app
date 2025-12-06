# Workout Menu - Flow Mapping

This document maps the possible user flows within the `WorkoutMenu.ts` module. You can use these flows as a checklist to manually verify the logic 1 by 1.

## Prerequisites
Before testing these flows, ensure you have:
1.  A user created in the database.
2.  At least one program created (unless testing "No Active Programs").
3.  Exercises assigned to the days in the program (unless testing "No Exercises").

---

## 2. Starting a Session

### Flow 2.1: No Exercises Found
**Scenario**: User selects a valid program, but the calculated "next day" has no exercises.
- [ ] **Setup**: Create a program and a day, but **do not** assign any exercises to that day.
- [ ] **Action**: Select the program from the list.
- [ ] **Expected Output**:
    - Message: `Loading exercises for: [Day Name]...`
    - Message: `No exercises found for this day.`
    - App waits for key press.
    - App returns to Program Selection (loops back).

### Flow 2.2: Session Start (Success)
**Scenario**: User selects a valid program with exercises.
- [ ] **Action**: Select a valid program.
- [ ] **Expected Output**:
    - Message: `Starting session for [Program Name]...`
    - Message: `Loading exercises for: [Next Day Name]...`
    - Enters the **Workout Session Loop** (displays first exercise).

---

## 3. During Session (Exercise Loop)

### Flow 3.1: Complete a Set
**Scenario**: User completes a set for an exercise.
- [ ] **Action**: Inside the session, look for `c: Complete Set [N]`.
- [ ] **Action**: Enter `c`.
- [ ] **Action**: Enter the value (reps or time) when prompted.
- [ ] **Expected Output**:
    - The set is marked as `Done: [Value]`.
    - The option to complete the *next* set appears (if any remain).

### Flow 3.2: Complete All Sets & Next Exercise
**Scenario**: User finishes all sets in an exercise.
- [ ] **Action**: Complete all sets using `c`.
- [ ] **Expected Output**:
    - Prompt changes to: `Press Enter to continue to next exercise...`
    - `s: Skip Exercise` option disappears.
- [ ] **Action**: Press Enter (or keep empty).
- [ ] **Expected Output**:
    - App loads the next exercise (or finishes workout if it was the last one).

### Flow 3.3: Skip Exercise
**Scenario**: User wants to skip the current exercise entirely.
- [ ] **Action**: Enter `s`.
- [ ] **Expected Output**:
    - The current exercise is skipped.
    - App loads the next exercise immediately (or finishes workout).
    - Note: Skipped exercises are logged with `is_skipped: true`.

### Flow 3.4: Exit Workout Early
**Scenario**: User wants to quit in the middle of a workout.
- [ ] **Action**: Enter `0`.
- [ ] **Expected Output**:
    - Message: `Saving workout data...`
    - Message: `Workout Saved (Incomplete)!`
    - App returns to Main Menu after key press.
    - **Verification**: `last_completed_day_id` should NOT be updated for the user program.

---

## 4. Completion

### Flow 4.1: Workout Completed Successfully
**Scenario**: User goes through all exercises (completing or skipping them) and finishes the last one.
- [ ] **Action**: Finish the last exercise in the list.
- [ ] **Expected Output**:
    - Message: `Saving workout data...`
    - Message: `Workout Completed!`
    - App returns to Main Menu after key press.
    - **Verification**: `last_completed_day_id` SHOULD be updated to the completed day.

