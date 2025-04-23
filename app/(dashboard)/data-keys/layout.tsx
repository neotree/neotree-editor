import { redirect } from "next/navigation";

import { Alert } from "@/components/alert";
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";

export default async function DataKeysLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    const [{ authenticatedUser, isSuperUser }] = await Promise.all([
        getAuthenticatedUserWithRoles(),
    ]);

    if (!authenticatedUser) redirect('/login');

    if (!isSuperUser) {
        return (
            <Alert 
                title="Not allowed"
                message="You don&apos;t have enough permissions to access this page!"
                redirectTo="/"
            />
        );
    }

    return (
        <>
            {children}
        </>
    );
}
