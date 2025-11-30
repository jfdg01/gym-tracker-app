import { db, expoDb } from './src/db/client';
import { items } from './src/db/schema';

export const initDatabase = () => {
    try {
        // We still use raw SQL for table creation for simplicity in this step
        // In a real app, we would use migrations
        expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

export const addItem = async (name) => {
    try {
        const result = await db.insert(items).values({ name }).returning();
        return result[0].id;
    } catch (error) {
        console.error('Error adding item:', error);
        throw error;
    }
};

export const getItems = async () => {
    try {
        const allItems = await db.select().from(items);
        return allItems;
    } catch (error) {
        console.error('Error getting items:', error);
        return [];
    }
};
