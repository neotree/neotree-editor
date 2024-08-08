import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { DashboardNavigation } from "./components/navigation";

export default async function SiteLayout({ children }: {
    children: React.ReactNode;
}) {
    const [authenticatedUser] = await Promise.all([
        getAuthenticatedUser(),
    ]);

    if (!authenticatedUser) redirect('/sign-in');

    return (
        <>
            <div className="flex">
                <DashboardNavigation 
                    user={authenticatedUser} 
                />

                <div className="flex-1 pt-24">
                    {children}
                </div>
            </div>
        </>
    );
}
