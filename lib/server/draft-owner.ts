import { headers } from "next/headers";

import { ACTING_USER_EMAIL_HEADER } from "@/lib/acting-user";

/**
 * Refuse to create or change drafts that nobody would own.
 *
 * A draft without an owner is invisible: scripts are not shaded for it, "publish my changes only" never
 * publishes it and editor saves refuse to touch it. Such drafts used to come from server-to-server calls
 * (API key) that did not say who triggered them, or named someone without an account on this editor.
 *
 * Only API-key requests are refused: a signed-in user always has an id, and code running outside a
 * request (CLI scripts) already requires one (scripts/cli-user.ts).
 */
export async function assertDraftOwner(userId?: string | null) {
    if (userId) return;

    let list: Awaited<ReturnType<typeof headers>>;
    try {
        list = await headers();
    } catch {
        return; // not in a request
    }
    if (!list.get("x-api-key")) return;

    const email = `${list.get(ACTING_USER_EMAIL_HEADER) || ""}`.trim();
    throw new Error(email
        ? `Refused: ${email} does not have an active account on this editor, so the changes would have no owner and could not be seen, published or discarded. Add ${email} to this editor and try again.`
        : "Refused: the request from the other editor did not say who made it, so the changes would have no owner and could not be seen, published or discarded. Update the other editor and try again.");
}
