# Data Model Critique & Recommendations

## 1. Missing Categorization (Critical)
**Issue**: The `exercises` table lacks fields for categorization.
**Impact**: Users cannot filter exercises by "Chest", "Back", or "Dumbbell". This makes the "Add Exercise" UI very difficult to use as the list grows.
**Recommendation**: Add `muscle_group` (e.g., 'chest', 'back', 'legs') and `equipment` (e.g., 'barbell', 'dumbbell', 'machine', 'bodyweight') columns to `exercises`.

## 2. Warm-up Sets (Important)
**Issue**: `performed_sets` treats all sets equally.
**Impact**: Warm-up sets will skew volume/1RM calculations if not distinguished from working sets.
**Recommendation**: Add a `type` column to `target_exercises` and `performed_sets` (enum: 'warmup', 'working', 'failure', 'drop').

## 3. Supersets Support (Feature)
**Issue**: The model assumes a linear list of exercises. Modern gym apps need to support Supersets (two exercises done back-to-back).
**Impact**: Cannot represent common training styles.
**Recommendation**: Add a `superset_id` (UUID or int) to `target_exercises` to group them.

## 4. Data Consistency
**Issue**: The ER diagram mentions `datetime` but the schema uses `INTEGER`.
**Recommendation**: Standardize on `INTEGER` (Unix Timestamp) for SQLite compatibility and ease of use.

## 5. JSON Schedule vs Relational
**Issue**: `programs.schedule_sequence` is JSON.
**Critique**: This is actually a **good choice** for this specific use case. It allows for complex rotations (e.g., "A, B, Rest, A, B, Rest, Rest") that are hard to model with a strict join table without over-engineering.
**Recommendation**: Keep as JSON.

## 6. Indexes (Efficiency)
**Issue**: No indexes defined beyond PK/FK.
**Recommendation**: Explicitly define indexes for:
- `exercises.name` (Search)
- `performed_sets.exercise_id` (History lookup)
- `sessions.started_at` (History sorting)

## 7. User Settings
**Issue**: `current_day_index` might be fragile if the schedule changes.
**Recommendation**: It's acceptable for a local app, but ensure app logic handles "index out of bounds" if the schedule is shortened.

## Proposed Schema Changes
I can apply these changes to `docs/data_model.md` to make it "perfect".
