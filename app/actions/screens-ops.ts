'use server';

import { sql } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { DataResponse } from '@/types';

export async function getScreenColumns(): Promise<DataResponse<string[]>> {
    try {
        const q = sql`SELECT * FROM information_schema.columns WHERE table_name = 'nt_screens';`;
        const res = await db.execute(q);
        const data = res.map(row => row.column_name) as string[];
        return { data, };
    } catch(e: any) {
        return { errors: [e.message], data: [], };
    }
}
