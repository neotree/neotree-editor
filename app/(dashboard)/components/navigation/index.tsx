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

    const showTopBar = true;
    const showSidebar = sys.data.use_sidebar_menu === 'yes';
    const showThemeToggle = sys.data.hide_theme_toggle !== 'yes';

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
