'use client';

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { SocketEventsListener as SocketEventsListenerComponent } from "@/components/socket-events-listener";

export function SocketEventsListener({
    onPublishData,
    onDiscardDrafts,
    onCreateScriptsDrafts,
    onCreateScreensDrafts,
    onCreateDiagnosesDrafts,
    onUpdateScriptsDrafts,
    onUpdateScreensDrafts,
    onUpdateDiagnosesDrafts,
    onDeleteScriptsDrafts,
    onDeleteScreensDrafts,
    onDeleteDiagnosesDrafts,
}: {
    onPublishData?: () => void;
    onDiscardDrafts?: () => void;
    onCreateScriptsDrafts?: () => void;
    onCreateScreensDrafts?: () => void;
    onCreateDiagnosesDrafts?: () => void;
    onUpdateScriptsDrafts?: () => void;
    onUpdateScreensDrafts?: () => void;
    onUpdateDiagnosesDrafts?: () => void;
    onDeleteScriptsDrafts?: () => void;
    onDeleteScreensDrafts?: () => void;
    onDeleteDiagnosesDrafts?: () => void;
}) {
    const pathname = usePathname();

    const {
        isNewScreenPage,
        isNewScriptPage,
        isScreenDraftPage,
        isScriptDraftPage,
        isScreenPage,
        isScriptPage,
    } = useMemo(() => {
        const isScreenDraftPage = pathname.includes('/screen/draft/');
        const isScriptDraftPage = pathname.includes('/script/draft/');
        return {
            isNewScreenPage: pathname === '/new-screen',
            isNewScriptPage: pathname === '/new-script',
            isScreenDraftPage: isScreenDraftPage,
            isScriptDraftPage: isScriptDraftPage,
            isScreenPage: !isScreenDraftPage && pathname.includes('/screen/'),
            isScriptPage: !isScriptDraftPage && pathname.includes('/script/'),
        };
    }, [pathname]);

    return (
        <>
            <SocketEventsListenerComponent 
                events={[
                    {
                        name: 'data_changed',
                        onEvent: {
                            callback: (action) => {
                                if ((action === 'publish_data') && onPublishData) {
                                    onPublishData();
                                } else if ((action === 'discard_drafts') && onDiscardDrafts) {
                                    onDiscardDrafts();
                                } else if ((action === 'create_scripts_drafts') && onCreateScriptsDrafts) {
                                    onCreateScriptsDrafts();
                                } else if ((action === 'create_screens_drafts') && onCreateScreensDrafts) {
                                    onCreateScreensDrafts();
                                } else if ((action === 'create_diagnoses_drafts') && onCreateDiagnosesDrafts) {
                                    onCreateDiagnosesDrafts();
                                } else if ((action === 'update_scripts_drafts') && onUpdateScriptsDrafts) {
                                    onUpdateScriptsDrafts();
                                } else if ((action === 'update_screens_drafts') && onUpdateScreensDrafts) {
                                    onUpdateScreensDrafts();
                                } else if ((action === 'update_diagnoses_drafts') && onUpdateDiagnosesDrafts) {
                                    onUpdateDiagnosesDrafts();
                                } else if ((action === 'delete_scripts_drafts') && onDeleteScriptsDrafts) {
                                    onDeleteScriptsDrafts();
                                } else if ((action === 'delete_screens_drafts') && onDeleteScreensDrafts) {
                                    onDeleteScreensDrafts();
                                } else if ((action === 'delete_diagnoses_drafts') && onDeleteDiagnosesDrafts) {
                                    onDeleteDiagnosesDrafts();
                                }
                            },
                        },
                    },
                ]}
            />
        </>
    )
}
