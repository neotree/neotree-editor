import { config as dotEnvConfig } from 'dotenv';
import type { Config } from 'drizzle-kit';

dotEnvConfig({ path: '.env.development', });

export default {
    schema: './databases/pg/schema/index.ts',
    out: './databases/pg/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.POSTGRES_DB_URL!,
    },
} satisfies Config;
