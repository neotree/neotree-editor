import { relations, sql } from "drizzle-orm";
import { 
    boolean,
    index,
    integer,
    jsonb,
    pgTable, 
    serial, 
    text, 
    timestamp, 
    uuid,
} from "drizzle-orm/pg-core";

// DATA KEYS
export const dataKeys = pgTable(
    'nt_data_keys',
    {
        id: serial('id').primaryKey(),
        uuid: uuid('uuid').notNull().unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
        uniqueKey: uuid('unique_key').notNull().unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
        name: text('name').notNull(),
        label: text('label').default('').notNull(),
        refId: text('ref_id'),
        dataType: text('data_type').notNull(),
        confidential: boolean('confidential').notNull().default(true),
        options: jsonb('options').default([]).$type<string[]>().notNull(),
        metadata: jsonb('metadata').default({}).$type<Record<string, any>>().notNull(),
        version: integer('version').notNull(),

        publishDate: timestamp('publish_date').defaultNow().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    (table) => ({
        nameIndex: index('nt_data_keys_name_idx').on(table.name),
        nameLowerIndex: index('nt_data_keys_name_lower_idx').on(sql`lower(${table.name})`),
        dataTypeIndex: index('nt_data_keys_data_type_idx').on(table.dataType),
        deletedAtIndex: index('nt_data_keys_deleted_at_idx').on(table.deletedAt),
    }),
);

export const dataKeysRelations = relations(dataKeys, ({ many, one }) => ({
    history: many(dataKeysHistory),
    draft: one(dataKeysDrafts, {
        fields: [dataKeys.uuid],
        references: [dataKeysDrafts.dataKeyId],
    }),
}));

// DATA KEYS DRAFTS
export const dataKeysDrafts = pgTable(
    'nt_data_keys_drafts',
    {
        id: serial('id').primaryKey(),
        uuid: uuid('uuid').notNull().unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
        name: text('name').notNull(),
        uniqueKey: uuid('unique_key').notNull(),
        dataKeyId: uuid('data_key_id').references(() => dataKeys.uuid, { onDelete: 'cascade', }),
        data: jsonb('data').$type<typeof dataKeys.$inferInsert>().notNull(),
        createdByUserId: uuid('created_by_user_id'),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (table) => ({
        nameIndex: index('nt_data_keys_drafts_name_idx').on(table.name),
        uniqueKeyIndex: index('nt_data_keys_drafts_unique_key_idx').on(table.uniqueKey),
        dataKeyIdIndex: index('nt_data_keys_drafts_data_key_id_idx').on(table.dataKeyId),
    }),
);

export const dataKeysDraftsRelations = relations(dataKeysDrafts, ({ one }) => ({
    dataKey: one(dataKeys, {
        fields: [dataKeysDrafts.dataKeyId],
        references: [dataKeys.uuid],
    }),
}));

// DATA KEYS DRAFTS HISTORY
export const dataKeysHistory = pgTable(
    'nt_data_keys_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        dataKeyId: uuid('data_key_id').references(() => dataKeys.uuid, { onDelete: 'cascade', }).notNull(),
        restoreKey: uuid('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const dataKeysHistoryRelations = relations(dataKeysHistory, ({ one }) => ({
    dataKey: one(dataKeys, {
        fields: [dataKeysHistory.dataKeyId],
        references: [dataKeys.uuid],
    }),
}));
