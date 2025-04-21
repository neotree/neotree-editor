import { sql } from "drizzle-orm";
import { 
    json,
    pgTable, 
    serial, 
    text, 
    timestamp, 
    uuid,
} from "drizzle-orm/pg-core";

// DATA KEYS
export const dataKeys = pgTable('nt_data_keys', {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').notNull().unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
    name: text('name').notNull().unique(),
    label: text('label').default('').notNull(),
    dataType: text('data_type'),
    parentKeys: json('parent_keys').default([]).$type<string[]>().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});
