import { defineConfig } from '@playwright/test';

/**
 * Browser tests for the data key harmonisation pages.
 *
 * They change data (merge, revert, dismiss), so they only run against a
 * throwaway database: set E2E_DATABASE_URL to a copy whose name contains
 * "e2e" or "scratch", e.g.
 *   E2E_DATABASE_URL=postgres://user:pass@localhost:5433/neotree_e2e yarn test:e2e
 */
const databaseUrl = process.env.E2E_DATABASE_URL || '';
if (!databaseUrl) throw new Error('Set E2E_DATABASE_URL to a throwaway database to run the browser tests.');
const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');
if (!/(e2e|scratch)/i.test(databaseName)) {
    throw new Error(`Refusing to run browser tests against "${databaseName}": use a database whose name contains "e2e" or "scratch".`);
}

const port = Number(process.env.E2E_PORT || 3917);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 180_000,
    expect: { timeout: 60_000 },
    workers: 1,
    fullyParallel: false,
    reporter: [['list']],
    globalSetup: './tests/e2e/global-setup.ts',
    use: {
        baseURL,
        // Use the installed Chrome; no browser download needed.
        channel: 'chrome',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: `npx next dev -p ${port}`,
        url: `${baseURL}/login`,
        timeout: 240_000,
        reuseExistingServer: false,
        env: {
            POSTGRES_DB_URL: databaseUrl,
            NEXTAUTH_URL: baseURL,
            NEXT_PUBLIC_APP_URL: baseURL,
        },
    },
});
