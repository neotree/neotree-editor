'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import * as queries from "@/databases/queries/users";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getAuthenticatedUser() {
    try {
        const session = await getSession();

        if (!session?.user?.email) return null;

        const currentUser = await queries._getUser(session.user.email);

        return currentUser || null;
    } catch(e) {
        return null;
    }
}
