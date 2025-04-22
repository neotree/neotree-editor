import {} from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { dataKeys } from '@/databases/pg/schema';

export type CreateDataKeysParams = {
    data: typeof dataKeys.$inferInsert[];
};

export type CreateDataKeysResponse = {
    errors?: string[];
    data: {
        success: boolean;
    };
};

export async function _createDataKeys({
    data,
}: CreateDataKeysParams): Promise<CreateDataKeysResponse> {
    try {
        await db.insert(dataKeys).values(data);

        return {
            data: {
                success: true,
            },
        };
    } catch(e: any) {
        return {
            errors: [e.message],
            data: {
                success: false,
            },
        };
    }
}
