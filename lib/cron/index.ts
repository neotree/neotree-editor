import '@/server/env';
import db from '@/databases/pg/drizzle';
import { tmpTransactions } from '@/databases/pg/_tmp-transactions';

async function deleteTmpTransactions() {
    await db.delete(tmpTransactions);
}
