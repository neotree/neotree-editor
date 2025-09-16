import '@/server/env';
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";
import { inArray, sql, like } from 'drizzle-orm';

main();

async function main() {
    try {
        const res = await db.query.dataKeys.findMany({
            // where: sql`${schema.dataKeys.parentKeys}::text like '%GastOns%'`,
            // where: sql`${schema.dataKeys.parentKeys} @> '["GastOns"]'::jsonb`
            where: sql`${schema.dataKeys.parentKeys}::anyarray @> '["GastOns"]'::anyarray`
        });
        console.log(res);
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
