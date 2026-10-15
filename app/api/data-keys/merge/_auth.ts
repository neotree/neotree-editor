import { NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";

/** Merging writes drafts (a preview too, before rolling back): admins only. */
export async function authoriseDataKeyMerge() {
    const isAuthorised = await isAuthenticated();
    if (!isAuthorised.yes) {
        return { error: NextResponse.json({ success: false, errors: ['Unauthorised'] }), userId: undefined };
    }
    if (!['admin', 'super_user'].includes(isAuthorised.user?.role || '')) {
        return { error: NextResponse.json({ success: false, errors: ['Forbidden'] }, { status: 403 }), userId: undefined };
    }
    return { error: null, userId: isAuthorised.user?.userId };
}
