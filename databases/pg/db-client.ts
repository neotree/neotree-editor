import db from "@/databases/pg/drizzle"

export type DbClient = typeof db
export type TransactionClient = Parameters<Parameters<DbClient["transaction"]>[0]>[0]
export type DbOrTransaction = DbClient | TransactionClient
