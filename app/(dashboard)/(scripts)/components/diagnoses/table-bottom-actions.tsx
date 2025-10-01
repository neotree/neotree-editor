'use client';

import { Trash, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IScriptsContext } from "@/contexts/scripts";
import { ActionsBar } from "@/components/actions-bar";

type Props = {
    disabled?: boolean;
    diagnoses: Awaited<ReturnType<IScriptsContext['getDiagnoses']>>;
    selected: number[];
    onDelete: () => void;
    onCopy: () => void;
};

export function DiagnosesTableBottomActions({ disabled, selected, onDelete, onCopy, }: Props) {
    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        disabled={disabled}
                        onClick={() => setTimeout(() => onDelete(), 0)}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length} diagnoses` : 'Delete diagnosis'}</span>
                    </Button>

                    <Button
                        className="h-auto w-auto"
                        disabled={disabled}
                        onClick={() => setTimeout(() => onCopy(), 0)}
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Copy ${selected.length} diagnoses` : 'Copy diagnosis'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
