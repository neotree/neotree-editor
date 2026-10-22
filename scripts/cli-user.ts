import { _getUser } from '@/databases/queries/users';

let cached: Promise<string> | null = null;

/**
 * The user that drafts created by a maintenance script belong to. Without an owner nobody can publish
 * them ("publish my changes only" only publishes your own drafts), so scripts must say who runs them:
 *   --user=<email>   or   CLI_USER_EMAIL=<email>
 */
export function getCliUserId(): Promise<string> {
    if (!cached) {
        cached = (async () => {
            const arg = process.argv.find(a => a.startsWith('--user='));
            const email = `${arg ? arg.substring('--user='.length) : (process.env.CLI_USER_EMAIL || '')}`.trim();
            if (!email) {
                throw new Error('Pass --user=<email> (or set CLI_USER_EMAIL): drafts created by this script need an owner so they can be published.');
            }
            const user = await _getUser(email);
            if (!user) throw new Error(`User "${email}" was not found.`);
            return user.userId;
        })();
    }
    return cached;
}
