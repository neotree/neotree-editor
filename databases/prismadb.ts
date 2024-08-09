import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === 'production';

const prismadb = globalThis.prisma || new PrismaClient({
    log: isProd ? undefined : ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;

export default prismadb;
