'use client';

import { Trash, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";

type Props = {
    disabled?: boolean;
    selected: number[];
    onDelete: () => void;
    onCopy: () => void;
};

export function ItemsBottomActions({ disabled, selected, onDelete, onCopy, }: Props) {
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
                        <span>{selected.length > 1 ? `Delete ${selected.length} items` : 'Delete item'}</span>
                    </Button>

                    {/* <Button
                        className="h-auto w-auto"
                        disabled={disabled}
                        onClick={() => onCopy()}
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Copy ${selected.length} items` : 'Copy item'}</span>
                    </Button> */}
                </ActionsBar>
            )}
        </>
    );
}
