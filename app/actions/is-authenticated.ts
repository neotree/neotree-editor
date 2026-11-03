import { headers } from "next/headers";

import { validateApiKey, validateAuthClient, validateHeadersItem } from "@/app/actions/authenticate";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { _getUser } from "@/databases/queries/users";
import { ACTING_USER_EMAIL_HEADER } from "@/lib/acting-user";
import logger from "@/lib/logger";

/**
 * Server-to-server calls from another editor (script export, data-key export, drugs-library export)
 * authenticate with the site's API key. Without a user every draft they create has no owner, and
 * "publish my changes only" can never publish it. Such calls name the person who triggered them in
 * the x-acting-user-email header; when that person has an account here the request runs as them.
 *
 * The header is only honoured together with a valid API key, and it is attribution only: the acting
 * user never gets more than a normal user's role through it.
 */
async function resolveActingUser() {
    const headersList = await headers();
    const email = `${headersList.get(ACTING_USER_EMAIL_HEADER) || ''}`.trim();
    if (!email) return null;
    const user = await _getUser(email);
    if (!user?.isActive) return null;
    const { password: _password, ...rest } = user;
    return { ...rest, role: 'user' as const };
}

export async function isAuthenticated() {
	try {
        const viaApiKey = await validateHeadersItem('x-api-key', validateApiKey);
        let isAuthenticated = viaApiKey;

        if (!isAuthenticated) isAuthenticated = await validateHeadersItem('x-auth-token', value => validateAuthClient('token', value));

        let user: Awaited<ReturnType<typeof getAuthenticatedUser>> = null;
        if (viaApiKey) {
            user = (await resolveActingUser()) as typeof user;
        } else if (!isAuthenticated) {
            user = await getAuthenticatedUser();
            isAuthenticated = !!user;
        }

        // viaApiKey: a server-to-server call from another editor (or a script), not a person in the editor
        return { yes: isAuthenticated, user, viaApiKey, };
	} catch(e) {
		logger.error('isAuthenticated ERROR', e);
		return { yes: false, user: null, viaApiKey: false, };
	}
}
