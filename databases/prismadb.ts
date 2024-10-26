import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === 'production';

const dbLogging = !isProd && (`${process.env.DB_LOGGING}` === 'true');

const prismadb = globalThis.prisma || new PrismaClient({
    log: dbLogging ? ['query', 'info', 'warn', 'error'] : undefined,
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;

export default prismadb;
