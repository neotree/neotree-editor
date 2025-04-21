import { and, asc, inArray, sql } from "drizzle-orm";

import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";

export type DataKey = {
    name: typeof schema.dataKeys.$inferSelect['name'];
    label: typeof schema.dataKeys.$inferSelect['label'];
    dataType: typeof schema.dataKeys.$inferSelect['dataType'];
    parentKeys: typeof schema.dataKeys.$inferSelect['parentKeys'];
};

export type GetDataKeysParams = {
    key?: string | string[];
    dataType?: string | string[];
};

export type GetDataKeysResponse = {
    data: DataKey[];
    errors?: string[];
};

export async function _getDataKeys(params?: GetDataKeysParams): Promise<GetDataKeysResponse> {
    try {
        const keys = !params?.key ? [] : Array.isArray(params.key) ? params.key : [params.key];
        const dataTypes = !params?.dataType ? [] : Array.isArray(params.dataType) ? params.dataType : [params.dataType];

        const where = and(
            !keys.length ? undefined : inArray(
                sql`lower(${schema.dataKeys.name})`, 
                keys.map(key => key.toLowerCase())
            ),
            !dataTypes.length ? undefined : inArray(
                sql`lower(${schema.dataKeys.dataType})`, 
                dataTypes.map(t => t.toLowerCase())
            ),
        );

        const data = await db
            .select({ 
                name: schema.dataKeys.name, 
                label: schema.dataKeys.label, 
                dataType: schema.dataKeys.dataType, 
                parentKeys: schema.dataKeys.parentKeys, 
            })
            .from(schema.dataKeys)
            .where(where)
            .orderBy(asc(schema.dataKeys.label));

        return { data, };
    } catch(e: any) {
        logger.log('db_get_data_keys', e.message);
        return {
            data: [],
            errors: [e.message],
        };
    }
}
