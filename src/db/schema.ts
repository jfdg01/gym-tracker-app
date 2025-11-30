import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    created_at: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});
