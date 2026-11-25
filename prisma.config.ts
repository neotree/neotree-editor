import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer reads .env itself or takes the URL from schema.prisma. The URL is only
// needed by commands that talk to the sessions database (db pull, migrate); `prisma generate`
// runs without it, e.g. in CI where SESSIONS_DB_URL is not set.
const sessionsDbUrl = process.env.SESSIONS_DB_URL;

export default defineConfig({
    schema: "prisma/schema.prisma",
    ...(sessionsDbUrl ? { datasource: { url: sessionsDbUrl } } : {}),
});
