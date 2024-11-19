'use client';

import { useCallback } from "react";
import { FiAlertTriangle } from "react-icons/fi";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { useFiles } from "@/hooks/use-files";
  
export function Errors() {
    const { unhandledErrors } = useFiles();

    const onClose = useCallback(() => useFiles.setState({ unhandledErrors: [], }), []);

    return (
        <AlertDialog
            open={!!unhandledErrors.length}
            onOpenChange={open => !open && onClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{''}</AlertDialogTitle>

                    <AlertDialogDescription>{''}</AlertDialogDescription>

                    <div className="flex justify-center">
                        <FiAlertTriangle className="text-red-600 min-w-12 min-h-12 w-12 h-12" />
                    </div>

                    <div className="flex-1 text-lg" dangerouslySetInnerHTML={{ __html: unhandledErrors.join('\n'), }} />
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <div className="flex justify-end">
                        <Button
                            onClick={() => onClose()}
                            variant="outline"
                        >Okay</Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
  