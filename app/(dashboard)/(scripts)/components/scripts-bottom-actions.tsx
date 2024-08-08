'use client';

import { Trash, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";

type Props = {
    disabled?: boolean;
    selected: string[];
    onDelete: () => void;
    onCopy: (scripts: { scriptReference: string; isDraft: boolean; }[]) => void;
};

export function ScriptsBottomActions({ disabled, selected, onDelete, onCopy, }: Props) {
    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        disabled={disabled}
                        onClick={() => onDelete()}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length} scripts` : 'Delete script'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
