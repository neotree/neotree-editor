import { relations, sql } from "drizzle-orm";
import { 
    integer,
    jsonb,
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
    name: text('name').notNull().unique(),
    alias: text('alias').default('').notNull(),
    script: text('script'),
    version: integer('version').notNull(),
    publishDate: timestamp('publish_date').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});

export const aliasesRelations = relations(aliases, ({ many, one }) => ({
    history: many(aliasesHistory),
    draft: one(aliasesDrafts, {
        fields: [aliases.uuid],
        references: [aliasesDrafts.aliasId],
    }),
}));

// ALIASES DRAFTS
export const aliasesDrafts = pgTable('nt_aliases_drafts', {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').notNull().unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
    name: text('name').notNull().unique(),
    aliasId: uuid('alias_id').references(() => aliases.uuid, { onDelete: 'cascade', }),
    data: jsonb('data').$type<typeof aliases.$inferInsert>().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const aliasesDraftsRelations = relations(aliasesDrafts, ({ one }) => ({
    aliases: one(aliases, {
        fields: [aliasesDrafts.aliasId],
        references: [aliases.uuid],
    }),
}));

// ALIASES DRAFTS HISTORY
export const aliasesHistory = pgTable(
    'nt_aliases_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        aliasId: uuid('alias_id').references(() => aliases.uuid, { onDelete: 'cascade', }).notNull(),
        restoreKey: uuid('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const aliasesHistoryRelations = relations(aliasesHistory, ({ one }) => ({
    aliases: one(aliases, {
        fields: [aliasesHistory.aliasId],
        references: [aliases.uuid],
    }),
}));