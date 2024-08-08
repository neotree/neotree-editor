'use server';

import { _getRoles } from "@/databases/queries/roles";
import logger from "@/lib/logger";

export async function getRoles() {
    try {
        const roles = await _getRoles();
        return roles;
    } catch(e) {
        logger.error('getRoles ERROR:', e);
        return [];
    }
}
