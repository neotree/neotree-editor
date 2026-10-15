import bcrypt from 'bcrypt';
import postgres from 'postgres';

export const E2E_USER_EMAIL = 'e2e-data-key-merge@neotree.test';

/** Seeds (or resets) a super user the browser tests sign in as. */
export default async function globalSetup() {
    const password = `e2e-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const sql = postgres(process.env.E2E_DATABASE_URL!, { max: 1 });
    try {
        const hash = await bcrypt.hash(password, 10);
        await sql`
            insert into nt_users (email, password, display_name, role, activation_date)
            values (${E2E_USER_EMAIL}, ${hash}, 'E2E Merge Tester', 'super_user', now())
            on conflict (email) do update set password = excluded.password, role = 'super_user'
        `;
    } finally {
        await sql.end();
    }
    // Workers inherit the environment of the global setup.
    process.env.E2E_USER_PASSWORD = password;
}
