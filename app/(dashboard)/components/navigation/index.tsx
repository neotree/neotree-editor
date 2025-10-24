'use client';

import { useMemo } from "react";

import { useAppContext, IAppContext } from "@/contexts/app";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { usePendingChanges } from "@/hooks/use-pending-changes";

type Props = {
    user: IAppContext['authenticatedUser'];
    // Optional props for entity-specific changelog tracking
    currentEntityId?: string;
    currentEntityType?: string;
    currentEntityName?: string;
    getEntityHistory?: (entityId: string) => Promise<{ data: any[]; errors?: string[] }>;
};

export function DashboardNavigation(props: Props) {
    const { sys, isAdmin, isSuperUser } = useAppContext();

    const showTopBar = true;
    const showSidebar = true; // sys.data.use_sidebar_menu === 'yes';
    const showThemeToggle = sys.data.hide_theme_toggle !== 'yes';

    // Get all pending changes across entities (for global indicator)
    const { allChangesByEntity } = usePendingChanges({
        autoTrack: false,
    });

    // Calculate total pending changes across all entities
    const totalPendingChanges = useMemo(() => {
        if (!allChangesByEntity) return 0;
        return Object.values(allChangesByEntity).reduce((sum, changes) => sum + changes.length, 0);
    }, [allChangesByEntity]);

    if (!props.user) return null;

    return (
        <>
            {showSidebar && <Sidebar />}

            <Header 
                user={props.user}
                showTopBar={showTopBar}
                showSidebar={showSidebar}
                showThemeToggle={showThemeToggle}
            />
        </>
    );
}