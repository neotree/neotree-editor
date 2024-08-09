'use client';

import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionsBar } from "@/components/actions-bar";
import { useEmailTemplatesContext } from "@/contexts/email-templates";

export function BottomActions() {
    const { selected, onDelete, } = useEmailTemplatesContext();

    if (!selected.length) return null;

    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        onClick={() => onDelete(selected)}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length}` : 'Delete'}</span>
                    </Button>
                </ActionsBar>
            )}
        </>
    );
}