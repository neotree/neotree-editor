import { test, type Page } from '@playwright/test';

import { E2E_USER_EMAIL } from './global-setup';

/**
 * Signs in through next-auth's credentials endpoint (the session cookie lands
 * in the page's context) and switches the portal to development mode, where
 * editing is allowed.
 */
export async function signIn(page: Page, { mode = 'development' }: { mode?: 'development' | 'view' } = {}) {
    const baseURL = test.info().project.use.baseURL!;
    await page.context().addCookies([{ name: 'mode', value: mode, url: baseURL }]);

    const csrf = await page.request.get('/api/auth/csrf');
    const { csrfToken } = await csrf.json();
    const res = await page.request.post('/api/auth/callback/credentials', {
        form: {
            csrfToken,
            email: E2E_USER_EMAIL,
            password: process.env.E2E_USER_PASSWORD || '',
            json: 'true',
        },
    });
    if (!res.ok()) throw new Error(`Sign in failed: ${res.status()}`);
}
