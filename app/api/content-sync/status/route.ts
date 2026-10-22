import { NextRequest, NextResponse } from "next/server";

import { getContentSyncStatus } from "@/app/actions/content-sync";
import { isAuthenticated } from "@/app/actions/is-authenticated";

/** How scripts stand between this editor and the linked one, each compared on its own; ?scriptId= for one script. */
export async function GET(req: NextRequest) {
    const isAuthorised = await isAuthenticated();
    if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
    const refresh = req.nextUrl.searchParams.get('refresh') === '1';
    const scriptId = req.nextUrl.searchParams.get('scriptId') || undefined;
    return NextResponse.json(await getContentSyncStatus({ refresh, scriptId }));
}
