import { db } from './client';
import * as schema from './schema';

export const seedDatabase = async () => {
    console.log('Seeding database...');
    try {
        const existingItems = await db.select().from(schema.items).limit(1);
        if (existingItems.length === 0) {
            await db.insert(schema.items).values([
                { name: 'Item 1', description: 'This is the first item' },
                { name: 'Item 2', description: 'This is the second item' },
                { name: 'Item 3', description: 'This is the third item' },
                { name: 'Item 4', description: 'This is the fourth item' },
                { name: 'Item 5', description: 'This is the fifth item' },
                { name: 'Item 6', description: 'This is the sixth item' },
                { name: 'Item 7', description: 'This is the seventh item' },
                { name: 'Item 8', description: 'This is the eighth item' },
                { name: 'Item 9', description: 'This is the ninth item' },
                { name: 'Item 10', description: 'This is the tenth item' },
            ]);
            console.log('Database seeded successfully');
        } else {
            console.log('Database already seeded');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
