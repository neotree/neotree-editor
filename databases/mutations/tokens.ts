import moment from "moment";

import db from "../pg/drizzle";
import { tokens } from "../pg/schema";

export async function _addUserToken({ userId, hoursValid }: {
    userId: string;
    hoursValid: number;
}) {
    const res = await db.insert(tokens).values({
        userId,
        validUntil: moment(new Date()).add(hoursValid, 'hour').toDate(),
        token: Math.floor(100000 + Math.random() * 900000),
    }).returning();
    return res[0];
}
