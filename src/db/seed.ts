import { db } from './client';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

export const seedDatabase = async () => {
    try {
        // Check if exercises already exist
        const existingExercises = await db.select().from(schema.exercises).limit(1);
        if (existingExercises.length > 0) {
            return;
        }

        console.log('Seeding database...');
        console.log('Inserting exercises...');
        const exercisesData = [
            { name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell' },
            { name: 'Overhead Press', muscle_group: 'shoulders', equipment: 'barbell' },
            { name: 'Tricep Pushdown', muscle_group: 'triceps', equipment: 'cable' },
            { name: 'Pull Ups', muscle_group: 'back', equipment: 'bodyweight' },
            { name: 'Barbell Row', muscle_group: 'back', equipment: 'barbell' },
            { name: 'Bicep Curls', muscle_group: 'biceps', equipment: 'dumbbell' },
            { name: 'Squats', muscle_group: 'legs', equipment: 'barbell' },
            { name: 'Lunges', muscle_group: 'legs', equipment: 'dumbbell' },
            { name: 'Calf Raises', muscle_group: 'legs', equipment: 'machine' },
        ];

        const insertedExercises = await db.insert(schema.exercises).values(exercisesData).returning();
        const exerciseMap = new Map(insertedExercises.map(e => [e.name, e.id]));

        console.log('Inserting PPL Program...');
        const [pplProgram] = await db.insert(schema.programs).values({
            name: 'PPL Program',
            description: 'Push Pull Legs Split',
        }).returning();

        const pplDays = [
            { name: 'Push Day', is_rest_day: false, order_index: 0 },
            { name: 'Pull Day', is_rest_day: false, order_index: 1 },
            { name: 'Legs Day', is_rest_day: false, order_index: 2 },
            { name: 'Rest Day', is_rest_day: true, order_index: 3 },
        ];

        for (const dayData of pplDays) {
            const [day] = await db.insert(schema.days).values({
                program_id: pplProgram.id,
                ...dayData,
            }).returning();

            if (day.name === 'Push Day') {
                await db.insert(schema.day_exercises).values([
                    { day_id: day.id, exercise_id: exerciseMap.get('Bench Press')!, order_index: 0, target_sets: 3, target_reps: 8, rest_time_seconds: 60, min_reps: 4, max_reps: 12 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Overhead Press')!, order_index: 1, target_sets: 3, target_reps: 10, rest_time_seconds: 60, min_reps: 6, max_reps: 15 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Tricep Pushdown')!, order_index: 2, target_sets: 3, target_reps: 12, rest_time_seconds: 45, min_reps: 8, max_reps: 15 },
                ]);
            } else if (day.name === 'Pull Day') {
                await db.insert(schema.day_exercises).values([
                    { day_id: day.id, exercise_id: exerciseMap.get('Pull Ups')!, order_index: 0, target_sets: 3, target_reps: 5, rest_time_seconds: 90, min_reps: 3, max_reps: 8 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Barbell Row')!, order_index: 1, target_sets: 3, target_reps: 8, rest_time_seconds: 60, min_reps: 6, max_reps: 12 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Bicep Curls')!, order_index: 2, target_sets: 3, target_reps: 12, rest_time_seconds: 45, min_reps: 8, max_reps: 15 },
                ]);
            } else if (day.name === 'Legs Day') {
                await db.insert(schema.day_exercises).values([
                    { day_id: day.id, exercise_id: exerciseMap.get('Squats')!, order_index: 0, target_sets: 5, target_reps: 5, rest_time_seconds: 90, min_reps: 3, max_reps: 8 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Lunges')!, order_index: 1, target_sets: 3, target_reps: 10, rest_time_seconds: 60, min_reps: 6, max_reps: 12 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Calf Raises')!, order_index: 2, target_sets: 3, target_reps: 15, rest_time_seconds: 45, min_reps: 10, max_reps: 20 },
                ]);
            }
        }

        console.log('Inserting Test Program...');
        const [testProgram] = await db.insert(schema.programs).values({
            name: 'Test Program',
            description: '2 Day Test Split',
        }).returning();

        const testDays = [
            { name: 'Active Day', is_rest_day: false, order_index: 0 },
            { name: 'Rest Day', is_rest_day: true, order_index: 1 },
        ];

        for (const dayData of testDays) {
            const [day] = await db.insert(schema.days).values({
                program_id: testProgram.id,
                ...dayData,
            }).returning();

            if (day.name === 'Active Day') {
                await db.insert(schema.day_exercises).values([
                    { day_id: day.id, exercise_id: exerciseMap.get('Bench Press')!, order_index: 0, target_sets: 2, target_reps: 5, rest_time_seconds: 30 },
                    { day_id: day.id, exercise_id: exerciseMap.get('Squats')!, order_index: 1, target_sets: 2, target_reps: 5, rest_time_seconds: 30 },
                ]);
            }
        }

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
