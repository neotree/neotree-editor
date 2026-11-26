import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === 'production';

const dbLogging = !isProd && (`${process.env.DB_LOGGING}` === 'true');

function createPrismaClient() {
    // Prisma 7 talks to Postgres through node-postgres instead of its own engine, so the
    // connection comes from a driver adapter rather than the schema's datasource URL.
    const adapter = new PrismaPg({
        connectionString: process.env.SESSIONS_DB_URL,
        // node-postgres drops idle connections after 10s by default, so most requests opened a new
        // one. Each new connection needs a DNS lookup and a SCRAM handshake on Node's small libuv
        // thread pool; when other work fills that pool (e.g. many slow outbound requests), the
        // sessions pages hung. Keep connections open, as Prisma 5's engine and our postgres.js
        // client do, and keep them alive through firewalls/NAT.
        idleTimeoutMillis: 0,
        keepAlive: true,
        // The default is to wait forever for a connection. Fail the request instead.
        connectionTimeoutMillis: 10_000,
    });

    return new PrismaClient({
        adapter,
        log: dbLogging ? ['query', 'info', 'warn', 'error'] : undefined,
    });
}

const prismadb = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;

export default prismadb;
