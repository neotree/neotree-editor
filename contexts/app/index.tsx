'use client';

import { createContext, useContext, useEffect, useMemo, } from "react";
import { useTheme } from "next-themes";

import { Mode } from "@/types";
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { getSites } from "@/app/actions/sites";
import * as sysActions from "@/app/actions/sys";
import * as opsActions from "@/app/actions/ops";

export type IAppContext = AppContextProviderProps & {
    viewOnly: boolean;
}

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);

type AppContextProviderProps = typeof opsActions & 
    typeof sysActions &
    Awaited<ReturnType<typeof opsActions.getEditorDetails>> &
    Awaited<ReturnType<typeof getAuthenticatedUserWithRoles>> &
    {
        mode: Mode;
        sys: Awaited<ReturnType<typeof sysActions.getSys>>;
        getSites: typeof getSites;
    };

export function AppContextProvider({ 
    children, 
    ...props
}: AppContextProviderProps & {
    children: React.ReactNode;
}) {
    const { isAdmin, isSuperUser, mode, sys, } = props;
    const { setTheme } = useTheme();

    const viewOnly = (!isAdmin && !isSuperUser) || (mode === 'view');

    useEffect(() => { 
        if (sys.data.hide_theme_toggle === 'yes') setTheme('light'); 
    }, [sys])

    const ctx = {
        ...props,
        viewOnly,
    };

    return (
        <AppContext.Provider
            value={ctx}
        >
            {children}
        </AppContext.Provider>
    );
}
