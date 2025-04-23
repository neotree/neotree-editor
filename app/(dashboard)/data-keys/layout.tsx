import { redirect } from "next/navigation";

import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { Alert } from "@/components/alert";

export default async function DataKeysLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    const [user] = await Promise.all([
        getAuthenticatedUserWithRoles(),
    ]);

    if (!user) redirect('/login');

    if (!user.isSuperUser) {
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
