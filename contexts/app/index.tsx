'use client';

import { createContext, useContext, useEffect, useMemo, } from "react";
import { useTheme } from "next-themes";

import { Mode } from "@/types";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { getSites } from "@/app/actions/sites";
import * as sysActions from "@/app/actions/sys";
import * as opsActions from "@/app/actions/ops";

export interface IAppContext extends  
AppContextProviderProps
{
    viewOnly: boolean;
    isDefaultUser: boolean;
    isAdmin: boolean;
    isSuperUser: boolean;
}

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);

type AppContextProviderProps = typeof opsActions & 
    typeof sysActions &
    Awaited<ReturnType<typeof opsActions.getEditorDetails>> &
    {
        mode: Mode;
        sys: Awaited<ReturnType<typeof sysActions.getSys>>;
        authenticatedUser: Awaited<ReturnType<typeof getAuthenticatedUser>>;
        getSites: typeof getSites;
    };

export function AppContextProvider({ 
    children, 
    ...props
}: AppContextProviderProps & {
    children: React.ReactNode;
}) {
    const { authenticatedUser, mode, sys, } = props;
    const { setTheme } = useTheme();

    const authenticatedUserRoles = useMemo(() => {
        const isAdmin = authenticatedUser?.role === 'admin';
        const isSuperUser = authenticatedUser?.role === 'super_user';
        return {
            isDefaultUser: !isAdmin && !isSuperUser,
            isAdmin,
            isSuperUser,
        };
    }, [authenticatedUser]);

    const viewOnly = useMemo(() => {
        return (!authenticatedUserRoles.isAdmin && !authenticatedUserRoles.isSuperUser) ||
            (mode === 'view');
    }, [authenticatedUserRoles, mode]);

    useEffect(() => { if (sys.data.hide_theme_toggle === 'no') setTheme('light'); }, [sys])

    const ctx = {
        ...props,
        ...authenticatedUserRoles,
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
