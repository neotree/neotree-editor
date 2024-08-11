'use client';

import { useMemo } from "react";

import { useAppContext, IAppContext } from "@/contexts/app";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

type Props = {
    user: IAppContext['authenticatedUser'];
};

export function DashboardNavigation(props: Props) {
    const { sys, isAdmin, isSuperUser } = useAppContext();

    const showTopBar = useMemo(() => (isAdmin || isSuperUser), [isAdmin, isSuperUser]);
    const showSidebar = useMemo(() => sys.data.use_sidebar_menu === 'yes', [sys.data.use_sidebar_menu]);
    const showThemeToggle = useMemo(() => sys.data.hide_theme_toggle !== 'yes', [sys.data.hide_theme_toggle]);

    if (!props.user) return null;

    return (
        <>
            {showSidebar && <Sidebar />}

            <Header 
                {...props} 
                showTopBar={showTopBar}
                showSidebar={showSidebar}
                showThemeToggle={showThemeToggle}
            />
        </>
    );
}
