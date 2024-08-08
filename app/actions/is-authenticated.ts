import { validateApiKey, validateAuthClient, validateHeadersItem } from "@/app/actions/authenticate";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import logger from "@/lib/logger";

export async function isAuthenticated() {
	try {
        let isAuthenticated = await validateHeadersItem('x-api-key', validateApiKey);

        if (!isAuthenticated) isAuthenticated = await validateHeadersItem('x-auth-token', value => validateAuthClient('token', value));

        let user: Awaited<ReturnType<typeof getAuthenticatedUser>> = null;
        if (!isAuthenticated) {
            user = await getAuthenticatedUser();
            isAuthenticated = !!user;
        }

        return { yes: isAuthenticated, user, };
	} catch(e) {
		logger.error('isAuthenticated ERROR', e);
		return { yes: false, user: null, };
	}
}
