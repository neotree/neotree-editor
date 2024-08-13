import db from "../pg/drizzle";

export async function _getRoles() {
    return await db.query.userRoles.findMany();
}
