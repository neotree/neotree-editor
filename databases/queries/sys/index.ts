import db from "@/databases/pg/drizzle";
import logger from "@/lib/logger";

export async function _getSys() {
    const response: {
        data: { [key: string]: string; };
        errors?: string[];
    } = { data: {}, };

    try {
        const res = await db.query.sys.findMany();
        const data = res.reduce((acc, item) => {
            return {
                ...acc,
                [item.key]: item.value,
            };
        }, {} as { [key: string]: string; });
        response.data = data
    } catch(e: any) {
        response.errors = [e.message];
        logger.error('_getSys ERROR', e.message);
    } finally {
        return response;
    }
}
