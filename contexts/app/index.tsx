'use client';

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { io } from 'socket.io-client';
import { useTheme } from "next-themes";

import { Mode } from "@/types";
import { appServerActions } from "@/contexts/app/server-actions";
import { SocketEventsListener } from "@/components/socket-events-listener";
import { getSys } from "@/app/actions/sys";

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export interface IAppContext extends  
AppContextProviderProps,
ReturnType<typeof useAppContextHook>
{}

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);

type AppContextProviderProps = typeof appServerActions & {
    mode: Mode;
    _sys: Awaited<ReturnType<typeof getSys>>;
    draftsCount?: Awaited<ReturnType<typeof appServerActions._countAllDrafts>>;
    authenticatedUser: Awaited<ReturnType<typeof appServerActions._getAuthenticatedUser>>;
};

export function AppContextProvider({ 
    children, 
    ...props
}: AppContextProviderProps & {
    children: React.ReactNode;
}) {
    const hook = useAppContextHook(props);

    const ctx = {
        ...props,
        ...hook,
    };

    return (
        <AppContext.Provider
            value={ctx}
        >
            {children}

            <SocketEventsListener 
                events={[
                    {
                        name: 'mode_changed',
                        onEvent: {
                            callback(mode) {
                                ctx.setModeState(prev => mode === prev ? prev : mode);
                                if (mode === 'development') ctx.countAllDrafts();
                            },
                        },
                    },
                    {
                        name: 'update_system',
                        onEvent: {
                            callback() { ctx.getSys(); },
                        },
                    },

                ]}
            />
        </AppContext.Provider>
    );
}


function useAppContextHook({
    _sys,
    mode: modeProp,
    draftsCount: draftsCountProp,
    authenticatedUser,
    _countAllDrafts,
    _getMode,
    _setMode,
    _getSys,
}: AppContextProviderProps) {
    const { setTheme } = useTheme();
    const [sys, setSys] = useState(_sys.data);

    const authenticatedUserRoles = useMemo(() => {
        const isAdmin = authenticatedUser?.role === 'admin';
        const isSuperUser = authenticatedUser?.role === 'super_user';
        return {
            isDefaultUser: !isAdmin && !isSuperUser,
            isAdmin,
            isSuperUser,
        };
    }, [authenticatedUser]);

    const [draftsCount, setDraftsCount] = useState<Awaited<ReturnType<typeof _countAllDrafts>>>(draftsCountProp || {
        screens: 0,
        scripts: 0,
        configKeys: 0,
        diagnoses: 0,
    });
    const [mode, setModeState] = useState<Mode>(modeProp || 'view');

    const totalDrafts = useMemo(() => {
        return draftsCount.scripts +
            draftsCount.screens +
            draftsCount.diagnoses +
            draftsCount.configKeys;
    }, [draftsCount]);

    const viewOnly = useMemo(() => {
        return (!authenticatedUserRoles.isAdmin && !authenticatedUserRoles.isSuperUser) ||
            (mode === 'view');
    }, [authenticatedUserRoles, mode]);

    const getMode = useCallback(async () => {
        const mode = await _getMode();
        setModeState(mode || 'view');
        return mode;
    }, [_getMode]);

    const setMode = useCallback(async (mode: Mode) => {
        await _setMode(mode);
        setModeState(mode);
    }, [_setMode]);

    const countAllDrafts = useCallback(async () => {
        const res = await _countAllDrafts();
        setDraftsCount(res);
        return res;
    }, [_countAllDrafts]);

    const getSys = useCallback(async () => {
        const res = await _getSys();
        if (!res.errors?.length) setSys(res.data);
        if (res.data.hide_theme_toggle === 'yes') setTheme('light');
        return res;
    }, [_countAllDrafts]);

    return {
        socket,
        mode,
        totalDrafts,
        sys,
        viewOnly,
        getSys,
        setSys,
        setModeState,
        countAllDrafts,
        getMode,
        setMode,
        ...authenticatedUserRoles,
    };
}
