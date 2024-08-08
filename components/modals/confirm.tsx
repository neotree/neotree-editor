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
        positiveLabel, 
        negativeLabel, 
        close, 
        onConfirm, 
    } = useConfirmModal();

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={close}
        >
            <AlertDialogContent className="p-0 max-h-[80%] flex flex-col">
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
                    {danger && <FiAlertCircle className="text-red-600 min-w-10 min-h-10 w-10 h-10" />}
                    <div dangerouslySetInnerHTML={{ __html: message, }} />
                </div>

                <AlertDialogFooter className="px-4 py-2">
                    <AlertDialogCancel>{negativeLabel}</AlertDialogCancel>
                    <Button
                        variant={danger ? 'destructive' : undefined}
                        asChild
                    >
                        <AlertDialogAction
                            onClick={() => onConfirm?.()}
                        >
                            {positiveLabel}
                        </AlertDialogAction>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
  