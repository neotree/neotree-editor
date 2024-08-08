'use client';

import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";
import { useConfigKeysContext } from "@/contexts/config-keys";

export function BottomActions() {
    const { selected, configKeys, onDelete, } = useConfigKeysContext();

    if (!selected.length) return null;

    const configKeysIds = configKeys.data.filter((_, i) => selected.includes(i)).map(s => s.configKeyId);

    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        onClick={() => onDelete(configKeysIds)}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length}` : 'Delete'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
