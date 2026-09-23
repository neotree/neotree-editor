import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { copyScripts } from "@/app/actions/scripts";
import logger from "@/lib/logger";
import { tmpTransactions } from "@/databases/pg/schema";
import { endTransaction, startTransaction, unlinkTransaction } from "@/app/actions/tmp-transactions";

export async function POST(req: NextRequest) {
    let transaction: null | typeof tmpTransactions.$inferSelect = null;

    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
            
        const body = await req.json();

        const requestKey = body.requestKey || isAuthorised.user?.userId;

        const transRes = await startTransaction({ 
            throwError: true,
            name: 'copyScripts',
            metadata: { 
                ...body,
                requestKey,
            }, 
        });

        transaction = transRes.transaction;
        
        const data = await copyScripts({
            ...body,
            requestKey,
            transactionId: transaction?.transactionId || undefined,
        });

        if (transaction?.transactionId) {
            await unlinkTransaction({ 
                throwError: true,
                transactionId: transaction.transactionId, 
            });
        }

        return NextResponse.json(data);
    } catch(e: any) {
        logger.log('/api/scripts/copy', e);
        return NextResponse.json({ errors: [e.message], });
    } finally {
        if (transaction) {
            await endTransaction({ transactionUuid: transaction.uuid, });
        }
    }
}
