'use client';

import { useCallback, useState } from "react";
import { MoreHorizontal, RefreshCcw } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useAppContext } from "@/contexts/app";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { type SyncDataKeysResponse } from "@/databases/mutations/data-keys";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/loader";

export function ScriptsTableHeaderActions() {
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();
    const [loading, setLoading] = useState(false);
    const { isSuperUser, viewOnly } = useAppContext();
    const router = useRouter();

    const onSyncDataKeys = useCallback(() => {
        confirm(
            async () => {
                try {
                    setLoading(true);

                    const res = await axios.post<SyncDataKeysResponse>('/api/data-keys/sync');
                    const { errors, data: { synced }, } = res.data;

                    if (errors?.length) {
                        alert({
                            title: 'Error',
                            variant: 'error',
                            message: errors.map(e => `<p class="text-sm text-red-400">${e}</p>`).join(''),
                        });
                    } else {
                        const getInfoItem = (itemName: keyof typeof synced) => {
                            const className = synced[itemName] ? '' : 'opacity-50';
                            return `<p class="text-sm font-bold capitalize ${className}"><em>${itemName}: ${synced[itemName]}</em></p>`;
                        };

                        alert({
                            title: 'Success',
                            variant: 'success',
                            message: `
                                <p class="text-lg">Data keys synced successfully!</p>
                                ${getInfoItem('scripts')}
                                ${getInfoItem('screens')}
                                ${getInfoItem('diagnoses')}
                            `,
                            onClose: () => router.refresh(),
                        });
                    }

                    console.log(res);
                } catch(e: any) {
                    alert({
                        title: 'Error',
                        variant: 'error',
                        message: e.message,
                    });
                } finally {
                    setLoading(false);
                }
            },
            {
                title: 'Sync data keys',
                message: 'Are you sure?',
                positiveLabel: 'Sync',
            },
        );
    }, [loading, router, confirm, alert]);

    if (!isSuperUser || viewOnly) return null;

    return (
        <>
            {loading && <Loader overlay />}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                        <MoreHorizontal className="size-5" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onSyncDataKeys()}>
                    <RefreshCcw className="size-4 mr-2" />
                        Sync data keys
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
