'use client';

import { Trash, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IScriptsContext } from "@/contexts/scripts";
import { ActionsBar } from "@/components/actions-bar";

type Props = {
    disabled?: boolean;
    screens: Awaited<ReturnType<IScriptsContext['getScreens']>>;
    selected: number[];
    onDelete: () => void;
    onCopy: () => void;
};

export function ScreensTableBottomActions({ disabled, selected, onDelete, onCopy, }: Props) {
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
                        <span>{selected.length > 1 ? `Delete ${selected.length} screens` : 'Delete screen'}</span>
                    </Button>

                    <Button
                        className="h-auto w-auto"
                        disabled={disabled}
                        onClick={() => onCopy()}
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Copy ${selected.length} diagnoses` : 'Copy diagnosis'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}
