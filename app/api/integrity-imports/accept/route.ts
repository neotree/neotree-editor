import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { acceptIntegrityImportSnapshot } from "@/app/actions/integrity-imports";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], success: false });

        const body = await req.json();
        const snapshotId = `${body?.snapshotId || ''}`.trim();

        if (!snapshotId) {
            return NextResponse.json({ errors: ['Missing snapshotId'], success: false });
        }

        const data = await acceptIntegrityImportSnapshot({
            snapshotId,
            scriptIds: Array.isArray(body?.scriptIds)
                ? body.scriptIds.filter((value: unknown): value is string => typeof value === "string" && !!value)
                : undefined,
        });

        return NextResponse.json(data);
    } catch (e: any) {
        logger.log('/api/integrity-imports/accept', e);
        return NextResponse.json({ errors: [e.message], success: false });
    }
}
