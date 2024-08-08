'use client';
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export interface AuthContextProps {
    children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProps) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
