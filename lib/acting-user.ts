/**
 * Header that server-to-server calls between editors use to say which person triggered them, so drafts
 * created on the receiving editor are owned by that person (see app/actions/is-authenticated.ts).
 */
export const ACTING_USER_EMAIL_HEADER = 'x-acting-user-email';

export function actingUserHeaders(email?: string | null): Record<string, string> {
    const value = `${email || ''}`.trim();
    return value ? { [ACTING_USER_EMAIL_HEADER]: value } : {};
}
