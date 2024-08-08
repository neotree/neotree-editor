'use client';

import { useCallback, useState } from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
  
export function AlertModal() {
    const { 
        isOpen, 
        title, 
        message, 
        variant, 
        buttonLabel, 
        close, 
        onClose, 
    } = useAlertModal();

    const closeModal = useCallback(() => {
        onClose?.();
        close();
    }, [close, onClose]);

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={closeModal}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={cn(!title && 'hidden')}>{title}</AlertDialogTitle>
                    {!!message && (
                        <div
                            className={cn(
                                'flex gap-y-4 flex-col sm:items-start sm:flex-row sm:gap-x-4',
                            )}
                        >
                            {variant === 'error' && (
                                <div className="flex justify-center">
                                    <FiAlertTriangle className="text-red-600 min-w-12 min-h-12 w-12 h-12" />
                                </div>
                            )}

                            {variant === 'success' && (
                                <div className="flex justify-center">
                                    <FiCheckCircle className="text-green-600 min-w-12 min-h-12 w-12 h-12" />
                                </div>
                            )}
                            
                            <div className="flex-1 text-lg">{message}</div>
                        </div>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <div className="flex justify-end">
                        <Button
                            onClick={closeModal}
                            variant="outline"
                        >{buttonLabel}</Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
  