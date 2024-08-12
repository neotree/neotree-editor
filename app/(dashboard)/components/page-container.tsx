import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";

export default async function DashboardPageContainer({ children }: {
    children: React.ReactNode;
}) {
    const [user] = await Promise.all([
        getAuthenticatedUser(),
    ]);

    if (!user) redirect('/login');

    return (
        <>
            {children}
        </>
    );
}
