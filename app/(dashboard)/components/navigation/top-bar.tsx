'use client';

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Content } from "@/components/content";
import { useAppContext } from "@/contexts/app";
import { Button } from "@/components/ui/button";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";

type Props = {

};

export function TopBar({}: Props) {
    const router = useRouter();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();
    const [loading, setLoading] = useState(false);
    const { 
        mode, 
        sys,
        shouldPublishData,
        isAdmin, 
        isSuperUser,
        setMode,
        publishData: _publishData, 
        discardDrafts: _discardDrafts 
    } = useAppContext();

    const publishData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await _publishData();
            if (res.errors) {
                alert({
                    variant: 'error',
                    title: 'Failed to publish data',
                    message: res.errors.map(e => `<div class="mb-1 text-sm text-danger">${e}</div>`).join(''),
                });
            } else {
                router.refresh();
                alert({
                    variant: 'success',
                    title: 'Success',
                    message: 'Data published successfully!',
                });
            }
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [_publishData, alert, router]);

    const discardDrafts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await _discardDrafts();
            if (res.errors) {
                alert({
                    variant: 'error',
                    title: 'Failed to discard changes',
                    message: res.errors.map(e => `<div class="mb-1 text-sm text-danger">${e}</div>`).join(''),
                });
            } else {
                router.refresh();
                alert({
                    variant: 'success',
                    title: 'Success',
                    message: 'Data discarded successfully!',
                });
            }
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [_discardDrafts, alert, router]);

    const usePlainBg = sys.data.use_plain_background === 'yes';
    const canSwitchModes = isAdmin || isSuperUser;

    return (
        <>
            {loading && <Loader overlay />}

            <Content className="p-0 flex items-center justify-center h-full">
                <div className="text-secondary-foreground flex items-center justify-center gap-x-2 text-xs">
                    <span>You&apos;re in <b>{mode}</b> mode</span>

                    <a 
                        href="#"
                        className={cn(
                            usePlainBg ? 'text-primary' : 'text-primary',
                            !canSwitchModes && 'hidden',
                        )}
                        onClick={e => {
                            e.preventDefault();
                            setMode(mode === 'development' ? 'view' : 'development');
                        }}
                    >
                        Switch to <b>{mode === 'development' ? 'view' : 'development'}</b> mode
                    </a>

                    {shouldPublishData && (isSuperUser || isAdmin) && (
                        <>
                            <Button
                                variant="destructive"
                                className="h-auto text-xs px-2 py-1"
                                onClick={() => confirm(discardDrafts, {
                                    title: 'Discard changes',
                                    message: 'Are you sure you want to discard changes?',
                                    negativeLabel: 'Cancel',
                                    positiveLabel: 'Discard',
                                    danger: true,
                                })}
                            >
                                Discard changes
                            </Button>

                            <Button
                                className="h-auto text-xs px-4 py-1"
                                onClick={() => confirm(publishData, {
                                    title: 'Publish data',
                                    message: 'Are you sure you want to publish data?',
                                    negativeLabel: 'Cancel',
                                    positiveLabel: 'Publish',
                                })}
                            >
                                Publish
                            </Button>
                        </>
                    )}
                </div>
            </Content>
        </>
    );
}
