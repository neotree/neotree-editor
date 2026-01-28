'use client';
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export interface AuthContextProps {
    children: ReactNode;
    session?: Session | null;
}

export function AuthContextProvider({ children, session }: AuthContextProps) {
    return (
        <SessionProvider
            session={session}
            refetchInterval={0}
            refetchOnWindowFocus={false}
        >
            {children}
        </SessionProvider>
    );
}
