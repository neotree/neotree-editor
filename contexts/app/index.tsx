'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useMount } from "react-use";

import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { getSitesWithoutConfidentialData } from "@/app/actions/sites";
import * as sysActions from "@/app/actions/sys";
import * as opsActions from "@/app/actions/ops";
import { getMode, setMode } from '@/lib/mode';
import socket from "@/lib/socket";
import { SocketEventsListener } from "@/components/socket-events-listener";

export type IAppContext = AppContextProviderProps &
    ReturnType<typeof useAppContextValue> &
    {
        viewOnly: boolean;
    };

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);

type AppContextProviderProps = Omit<typeof opsActions, 'setMode' | 'getMode'> & 
    typeof sysActions &
    Awaited<ReturnType<typeof opsActions.getEditorDetails>> &
    Awaited<ReturnType<typeof getAuthenticatedUserWithRoles>> &
    {
        sys: Awaited<ReturnType<typeof sysActions.getSys>>;
        getSites: typeof getSitesWithoutConfidentialData;
    };

export function AppContextProvider({ 
    children, 
    ...props
}: AppContextProviderProps & {
    children: React.ReactNode;
}) {
    const ctx = useAppContextValue(props);

    const [mounted, setMounted] = useState(false);

    useMount(() => { setMounted(true); });

    if (!mounted) return null;

    return (
        <AppContext.Provider
            value={ctx}
        >
            {children}

            <SocketEventsListener 
                events={[
                    {
                        name: 'mode_changed',
                        onEvent: { callback: ctx.onModeChange, },
                    },
                    // {
                    //     name: 'update_system',
                    //     onEvent: { refreshRouter: true, },
                    // },
                    // {
                    //     name: 'data_changed',
                    //     onEvent: { refreshRouter: true, },
                    // },

                ]}
            />
        </AppContext.Provider>
    );
}

function useAppContextValue(props: AppContextProviderProps) {
    const router = useRouter();

    const { isAdmin, isSuperUser, sys, } = props;
    const { setTheme } = useTheme();

    useEffect(() => { 
        if (sys.data.hide_theme_toggle === 'yes') setTheme('light'); 
    }, [sys]);

    const getModeState = useCallback(() => {
        return ((!isAdmin && !isSuperUser) ? 'view' : getMode()) || 'view';
    }, [isSuperUser, isAdmin]);

    const [mode, setModeState] = useState(getModeState());

    const viewOnly = (!isAdmin && !isSuperUser) || (mode === 'view');

    const _setMode: typeof setMode = useCallback((...args) => {
        const res = setMode(...args);
        socket.emit('mode_changed', getModeState());
        setModeState(getModeState());
        return res;
    }, [getModeState]);

    const onModeChange = useCallback(() => {
        setModeState(getModeState());
    }, [getModeState]);

    return {
        ...props,
        mode,
        viewOnly,
        onModeChange,
        getMode,
        setMode: _setMode,
    };
}
