import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import '@/lib/resize-observer-polyfill';
import { AuthContextProvider } from "@/components/providers/auth-context-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import { ConfirmModal } from "@/components/modals/confirm";
import { AlertModal } from "@/components/modals/alert";
import { AppContextProvider } from "@/contexts/app";
import { appServerActions } from "@/contexts/app/server-actions";
import { getSys } from "@/app/actions/sys";

import "./globals.css";

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['100', '300', '400', '500', '700', '900'],
}); 

export const metadata: Metadata = {
    title: "Neotree",
    description: "Neotree",
    icons: [
        {
            media: "(prefers-color-scheme: light)",
            url: '/images/favicon.ico',
            href: '/images/favicon.ico',
        },
        {
            media: "(prefers-color-scheme: dark)",
            url: '/images/favicon.ico',
            href: '/images/favicon.ico',
        },
    ],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode; }>) {
    const [
        authenticatedUser,
        mode,
        sys,
    ] = await Promise.all([
        appServerActions._getAuthenticatedUser(),
        appServerActions._getMode(),
        getSys(),
    ]);

    const draftsCount = mode !== 'development' ? undefined : await appServerActions._countAllDrafts();

    return (
        <html lang="en">
            <body className={roboto.className}>
                <AuthContextProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <AppContextProvider
                            _sys={sys}
                            mode={mode || 'view'}
                            draftsCount={draftsCount}
                            authenticatedUser={authenticatedUser}
                            {...appServerActions}
                        >
                            {children}
                        </AppContextProvider>
                        <Toaster />
                        <ConfirmModal />
                        <AlertModal />
                    </ThemeProvider>
                </AuthContextProvider>
            </body>
        </html>
    );
}
