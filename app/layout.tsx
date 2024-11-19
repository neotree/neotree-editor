import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import '@/lib/resize-observer-polyfill';
import { AuthContextProvider } from "@/components/providers/auth-context-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import { ConfirmModal } from "@/components/modals/confirm";
import { AlertModal } from "@/components/modals/alert";
import { FilesModal } from "@/components/modals/files";
import { AppContextProvider } from "@/contexts/app";
import { getSys } from "@/app/actions/sys";
import { getSitesWithoutConfidentialData } from "@/app/actions/sites";
import { getAuthenticatedUserWithRoles, } from "@/app/actions/get-authenticated-user";
import * as opsActions from "@/app/actions/ops";
import * as sysActions from "@/app/actions/sys";

import "@/app/globals.css";
import { SocketEventsListener } from "@/components/socket-events-listener";
import cookies from "@/lib/js-cookie";
import { Mode } from "@/types";

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
        editorDetails,
        authenticatedUser,
        sys,
    ] = await Promise.all([
        opsActions.getEditorDetails(),
        getAuthenticatedUserWithRoles(),
        getSys(),
    ]);

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
                            {...opsActions}
                            {...sysActions}
                            {...editorDetails}
                            {...authenticatedUser}
                            sys={sys}
                            getSites={getSitesWithoutConfidentialData}
                        >
                            {children}

                            <SocketEventsListener 
                                events={[
                                    {
                                        name: 'mode_changed',
                                        onEvent: { refreshRouter: true, },
                                    },
                                    {
                                        name: 'update_system',
                                        onEvent: { refreshRouter: true, },
                                    },
                                    {
                                        name: 'data_changed',
                                        onEvent: { refreshRouter: true, },
                                    },

                                ]}
                            />
                        </AppContextProvider>
                        <Toaster />
                        <ConfirmModal />
                        <AlertModal />
                        <FilesModal />
                    </ThemeProvider>
                </AuthContextProvider>
            </body>
        </html>
    );
}
