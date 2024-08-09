'use client';

import { Trash, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";

export function BottomActions({ scripts, selected, onDelete }: {
    selected: number[];
    scripts: Awaited<ReturnType<IScriptsContext['getScripts']>>['data'];
    onDelete: (scriptsIds: string[]) => void;
}) {
    const { setScriptsIdsToExport } = useScriptsContext();

    if (!selected.length) return null;

    const scriptsIds = scripts.filter((_, i) => selected.includes(i)).map(s => s.scriptId);

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

                    <Button
                        className="h-auto w-auto"
                        onClick={() => setScriptsIdsToExport(scriptsIds)}
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Export ${selected.length}` : 'Export'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
