import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";

export default async function OpsLayout({ children }: {
    children: React.ReactNode;
}) {
    const [authenticatedUser] = await Promise.all([
        getAuthenticatedUser(),
    ]);

    if (!['admin', 'super_user'].includes(authenticatedUser?.role!)) redirect('/');
    
    return (
        <>
            {children}
        </>
    );
}
