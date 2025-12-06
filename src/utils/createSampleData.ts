import { db } from '../db/client';
import { programs, days, exercises, day_exercises, user_settings } from '../db/schema';

/**
 * Helper function to create sample workout data for testing
 */
export async function createSampleWorkoutData() {
    console.log('Creating sample workout data...');

    try {
        // Create a sample program
        const [program] = await db.insert(programs).values({
            name: 'Push Pull Legs',
            description: 'Classic 3-day split for building strength'
        }).returning();

        // Create days
        const [pushDay] = await db.insert(days).values({
            program_id: program.id,
            name: 'Push Day',
            is_rest_day: false,
            order_index: 1
        }).returning();

        const [pullDay] = await db.insert(days).values({
            program_id: program.id,
            name: 'Pull Day',
            is_rest_day: false,
            order_index: 2
        }).returning();

        const [legDay] = await db.insert(days).values({
            program_id: program.id,
            name: 'Leg Day',
            is_rest_day: false,
            order_index: 3
        }).returning();

        // Create exercises
        const [benchPress] = await db.insert(exercises).values({
            name: 'Bench Press',
            description: 'Barbell bench press',
            track_type: 'reps',
            resistance_type: 'weight'
        }).returning();

        const [shoulderPress] = await db.insert(exercises).values({
            name: 'Shoulder Press',
            description: 'Dumbbell shoulder press',
            track_type: 'reps',
            resistance_type: 'weight'
        }).returning();

        const [pullups] = await db.insert(exercises).values({
            name: 'Pull-ups',
            description: 'Bodyweight pull-ups',
            track_type: 'reps',
            resistance_type: 'weight'
        }).returning();

        const [squats] = await db.insert(exercises).values({
            name: 'Squats',
            description: 'Barbell back squats',
            track_type: 'reps',
            resistance_type: 'weight'
        }).returning();

        // Add exercises to push day
        await db.insert(day_exercises).values([
            {
                day_id: pushDay.id,
                exercise_id: benchPress.id,
                order_index: 1,
                target_sets: 3,
                target_reps: 8,
                target_weight: 60,
                rest_time_seconds: 180,
                increase_rate: 2.5
            },
            {
                day_id: pushDay.id,
                exercise_id: shoulderPress.id,
                order_index: 2,
                target_sets: 3,
                target_reps: 10,
                target_weight: 20,
                rest_time_seconds: 120,
                increase_rate: 2.5
            }
        ]);

        // Add exercise to pull day
        await db.insert(day_exercises).values({
            day_id: pullDay.id,
            exercise_id: pullups.id,
            order_index: 1,
            target_sets: 3,
            target_reps: 8,
            target_weight: 0,
            rest_time_seconds: 180,
            increase_rate: 2.5
        });

        // Add exercise to leg day
        await db.insert(day_exercises).values({
            day_id: legDay.id,
            exercise_id: squats.id,
            order_index: 1,
            target_sets: 4,
            target_reps: 6,
            target_weight: 80,
            rest_time_seconds: 240,
            increase_rate: 5
        });

        // Create/update user settings
        await db.insert(user_settings).values({
            id: 1,
            current_program_id: program.id,
            language: 'en',
            name: 'User'
        }).onConflictDoUpdate({
            target: user_settings.id,
            set: {
                current_program_id: program.id
            }
        });

        console.log('✅ Sample data created successfully!');
        return {
            program,
            days: [pushDay, pullDay, legDay],
            exercises: [benchPress, shoulderPress, pullups, squats]
        };
    } catch (error) {
        console.error('❌ Failed to create sample data:', error);
        throw error;
    }
}
