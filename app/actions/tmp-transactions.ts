import { eq, sql } from "drizzle-orm";
import { v4 } from "uuid";
import fs from 'node:fs';
import path from 'node:path';

import db from "@/databases/pg/drizzle";
import { tmpTransactionDump, tmpTransactions } from "@/databases/pg/schema";

const getTransactionDir = (transactionUuid: string, opts?: {
    createIfNotExists?: boolean;
}) => {
    const { 
        createIfNotExists = true,
    } = { ...opts, };

    let dirExists = false;
    const dir = path.resolve('tmp', transactionUuid);

    if (createIfNotExists && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        dirExists = true;
    }

    return {
        dirExists,
        dir,
    };
}

export const writeFileToTransactionDir = async ({
    transactionUuid,
    fileData,
    filePath,
}: {
    transactionUuid: string;
    filePath: string;
    fileData: string;
}) => {
    const { dir } = getTransactionDir(transactionUuid);
    filePath = path.resolve(dir, filePath);
    fs.appendFileSync(filePath, fileData);
};

export const startTransaction = async (params: {
    name: string;
    metadata?: Record<string, any>; 
    throwError?: boolean;
}): Promise<{
    errors?: string[];
    transaction: null | typeof tmpTransactions.$inferSelect;
}> => {
    const { 
        name,
        metadata = {}, 
        throwError = false, 
    } = { ...params };

    try {
        const transactionId = v4();

        const [transaction = null] = await db.insert(tmpTransactions)
            .values({
                name,
                metadata,
                transactionId,
                uuid: transactionId,
            })
            .returning();
        
        return { transaction, }
    } catch(e: any) {
        if (throwError) throw e;
        return {
            errors: [e.message],
            transaction: null,
        };
    }
}

export const unlinkTransaction = async ({
    transactionId,
    throwError = false,
}: {
    transactionId: string;
    throwError?: boolean;
}): Promise<{
    errors?: string[];
    success: boolean;
}> => {
    try {
        await db.update(tmpTransactions).set({ transactionId: null, }).where(eq(tmpTransactions.uuid, transactionId));
        return { success: true, };
    } catch(e: any) {
        if (throwError) throw e;
        return {
            errors: [e.message],
            success: false,
        };
    }
};

export const endTransaction = async ({
    transactionUuid,
    throwError = false,
}: {
    transactionUuid: string;
    throwError?: boolean;
}): Promise<{
    errors?: string[];
    success: boolean;
}> => {
    try {
        await db.delete(tmpTransactions).where(eq(tmpTransactions.uuid, transactionUuid));

        const { dir, dirExists, } = getTransactionDir(transactionUuid);

        if (dirExists) fs.unlinkSync(dir);

        return { success: true, };
    } catch(e: any) {
        if (throwError) throw e;
        return {
            errors: [e.message],
            success: false,
        };
    }
};

export const dumpTmpTractionData = async ({ data, throwError, }: {
    data: (typeof tmpTransactionDump.$inferInsert)[];
    throwError?: boolean;
}): Promise<{
    errors?: string[];
    success: boolean;
}> => {
    try {
        if (data.length) {
            await db.insert(tmpTransactionDump).values(data);
        }
        return { success: true, };
    } catch(e: any) {
        if (throwError) throw e;
        return {
            errors: [e.message],
            success: false,
        };
    }
}
