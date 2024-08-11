import prismadb from "@/databases/prismadb";
import logger from "@/lib/logger";

// COUNT SESSIONS
export type CountSessionsResponse = {
    errors?: string[];
    total: number;
};

export async function _countSessions(): Promise<CountSessionsResponse> {
    try {
        const total = await prismadb.sessions.count();
        return { total };
    } catch(e: any) {
        logger.error('_countSessions ERROR', e.message);
        return { total: 0, errors: [e.message], }
    }
}
