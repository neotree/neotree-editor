import {sql } from "drizzle-orm";
import { 
    pgTable, 
    serial, 
    text, 
    timestamp, 
    uuid,
} from "drizzle-orm/pg-core";

// ALIASES
export const aliases = pgTable('nt_aliases', {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').notNull().unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
    name: text('name').notNull(),
    alias: text('alias').notNull(),
    script: text('script').notNull(),
    publishDate: timestamp('publish_date').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});
