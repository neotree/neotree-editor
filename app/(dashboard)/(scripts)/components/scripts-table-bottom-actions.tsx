'use client';

import { Trash, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";

export function ScriptsTableBottomActions({ selected, setScriptsIdsToExport, onDelete }: {
    selected: number[];
    onDelete: () => void;
    setScriptsIdsToExport: () => void;
}) {
    if (!selected.length) return null;

    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        onClick={() => onDelete()}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length}` : 'Delete'}</span>
                    </Button>

                    <Button
                        className="h-auto w-auto"
                        onClick={() => setScriptsIdsToExport()}
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Export ${selected.length}` : 'Export'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
