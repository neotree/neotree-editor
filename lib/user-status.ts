export const DEACTIVATED_ACCOUNT_MESSAGE = 'This account has been deactivated. Please contact an administrator.';

/** True when an administrator has switched the account off. */
export function isUserDeactivated(user?: { deactivatedAt?: Date | string | null } | null) {
    return !!user?.deactivatedAt;
}
