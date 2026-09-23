import { sql } from "drizzle-orm";
import { 
    integer, 
    jsonb, 
    pgTable, 
    serial, 
    text, 
    timestamp, 
    uuid, 
} from "drizzle-orm/pg-core";

// TEMPORARY TRANSACTIONS
// If a request fails, we'll use transaction_id to delete partial data written to the database. 
export const tmpTransactions = pgTable('nt_tmp_transactions', {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').unique().notNull().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
    name: text('name').notNull(),
    transactionId: uuid('transaction_id').unique().default(sql`md5(random()::text || clock_timestamp()::text)::uuid`),
    metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tmpTransactionDump = pgTable('nt_tmp_transaction_dump', {
    id: serial('id').primaryKey(),
    transactionUuid: uuid('transaction_uuid').notNull().references(() => tmpTransactions.uuid, { 
        onDelete: 'cascade', 
        onUpdate: 'cascade',
    }),
    name: text('name').notNull(),
    data: jsonb("data").$type<any>(),
});
