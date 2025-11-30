import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('gym_tracker.db');

export const initDatabase = () => {
    try {
        db.execSync(`
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

export const addItem = (name) => {
    try {
        const result = db.runSync('INSERT INTO items (name) VALUES (?)', name);
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error adding item:', error);
        throw error;
    }
};

export const getItems = () => {
    try {
        const allRows = db.getAllSync('SELECT * FROM items');
        return allRows;
    } catch (error) {
        console.error('Error getting items:', error);
        return [];
    }
};
