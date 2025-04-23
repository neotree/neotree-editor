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

export async function getAuthenticatedUserWithRoles() {
    try {
        const user = await getAuthenticatedUser();

        console.log(user);

        const isAdmin = user?.role === 'admin';
        const isSuperUser = user?.role === 'super_user';
        const isDefaultUser = (isAdmin || isSuperUser) ? false : true;

        return {
            isAdmin,
            isSuperUser,
            isDefaultUser,
            authenticatedUser: user,
        };
    } catch(e) {
        return {
            isAdmin: false,
            isSuperUser: false,
            isDefaultUser: false,
            authenticatedUser: null,
        };
    }
}
