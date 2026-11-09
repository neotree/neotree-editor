'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRef } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
  
export function ConfirmModal() {
    const { 
        isOpen, 
        danger,
        title, 
        message, 
        footerMessage,
        positiveLabel, 
        negativeLabel, 
        close, 
        onConfirm, 
        onDeny,
    } = useConfirmModal();

    // The answer runs once this dialog has fully closed. Closing a dialog underneath
    // (e.g. "Discard" closing the field being edited) in the same instant left the
    // page with pointer-events: none, so nothing could be clicked afterwards.
    const pending = useRef<(() => void) | null>(null);

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={close}
        >
            <AlertDialogContent
                className="p-0 max-h-[80%] flex flex-col sm:max-w-2xl"
                onCloseAutoFocus={(event) => {
                    const run = pending.current;
                    pending.current = null;
                    if (!run) return;
                    // The answer may open or close other dialogs; don't pull focus back here.
                    event.preventDefault();
                    run();
                }}
            >
                {!!title && (
                    <AlertDialogHeader className="py-2 px-4">
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </AlertDialogHeader>
                )}
                
                <div 
                    className={cn(
                        'px-4 flex-1 flex flex-col gap-y-4 items-center sm:items-start sm:flex-row sm:gap-x-4 overflow-y-auto',
                        !title && 'py-2',
                    )}
                >
                    {danger && <FiAlertCircle className="text-red-600 dark:text-red-400 min-w-10 min-h-10 w-10 h-10" />}
                    <div dangerouslySetInnerHTML={{ __html: message, }} />
                </div>

                <div className="border-t border-border px-4 py-3">
                    {!!footerMessage && (
                        <div
                            className="mb-3 text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: footerMessage }}
                        />
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => { pending.current = onDeny || null; }}
                        >{negativeLabel}</AlertDialogCancel>
                        <Button
                            variant={danger ? 'destructive' : undefined}
                            asChild
                        >
                            <AlertDialogAction
                                onClick={() => { pending.current = onConfirm || null; }}
                            >
                                {positiveLabel}
                            </AlertDialogAction>
                        </Button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
  
