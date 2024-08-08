import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
    title: `${process.env.NEXT_PUBLIC_APP_NAME} - Sign In`,
};

export default async function AuthLayout({ children }: {
    children: React.ReactNode;
}) {
    const [authenticatedUser] = await Promise.all([
        getAuthenticatedUser(),
    ]);

    if (authenticatedUser) redirect('/');

    return (
        <>
            <div
                className="
                    h-full
                    w-full
                    flex
                    flex-col
                    items-center
                    justify-center
                "
            >
                <div
                    className="w-full max-w-[350px] flex flex-col gap-y-12"
                >
                    <div className="flex justify-center">
                        <Logo />
                    </div>

                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
