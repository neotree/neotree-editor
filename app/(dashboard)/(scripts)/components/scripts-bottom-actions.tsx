'use client';

import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";
import { useScriptsContext } from "@/contexts/scripts";

export function BottomActions() {
    const { selected, scripts, onDelete, } = useScriptsContext();

    if (!selected.length) return null;

    const scriptsIds = scripts.data.filter((_, i) => selected.includes(i)).map(s => s.scriptId);

    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        onClick={() => onDelete(scriptsIds)}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length}` : 'Delete'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
