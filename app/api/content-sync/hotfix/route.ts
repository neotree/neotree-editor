import { NextRequest, NextResponse } from "next/server";

import { closeContentSyncHotfix, openContentSyncHotfix } from "@/app/actions/content-sync";
import { isAuthenticated } from "@/app/actions/is-authenticated";

/** Open or close a hotfix on one script of a target editor (admins). */
export async function POST(req: NextRequest) {
    const isAuthorised = await isAuthenticated();
    if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
    const body = await req.json().catch(() => ({})) as { action?: 'open' | 'close'; scriptId?: string; reason?: string; note?: string };
    if (body.action === 'close') return NextResponse.json(await closeContentSyncHotfix({ scriptId: body.scriptId || '', note: body.note }));
    return NextResponse.json(await openContentSyncHotfix({ scriptId: body.scriptId || '', reason: body.reason || '' }));
}
