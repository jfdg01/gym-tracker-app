import { db } from './client';
import { exercises } from './schema';

export const seedDatabase = async () => {
    try {
        console.log('Seeding database...');

        // Check if exercises exist
        const existingExercises = await db.select().from(exercises).limit(1);
        if (existingExercises.length > 0) {
            console.log('Database already seeded.');
            return;
        }

        await db.insert(exercises).values([
            { name: 'Bench Press', muscle_group: 'Chest', equipment: 'Barbell', variant: 'Flat' },
            { name: 'Squat', muscle_group: 'Legs', equipment: 'Barbell', variant: 'Back' },
            { name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell', variant: 'Conventional' },
            { name: 'Overhead Press', muscle_group: 'Shoulders', equipment: 'Barbell', variant: 'Standing' },
            { name: 'Pull Up', muscle_group: 'Back', equipment: 'Bodyweight' },
            { name: 'Dumbbell Curl', muscle_group: 'Biceps', equipment: 'Dumbbell' },
            { name: 'Tricep Extension', muscle_group: 'Triceps', equipment: 'Cable' },
            { name: 'Leg Press', muscle_group: 'Legs', equipment: 'Machine' },
        ]);

        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
