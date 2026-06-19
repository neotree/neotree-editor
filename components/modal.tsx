'use client';

import { isValidElement, useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogProps,
    DialogContentProps,
    DialogFooterProps,
    DialogTriggerProps,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useModalState } from "@/hooks/use-modal-state";

export type ModalProps = DialogProps & {
    id?: string;
    children?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    trigger?: React.ReactNode;
    contentProps?: DialogContentProps;
    bodyProps?: React.HTMLAttributes<HTMLDivElement>;
    footerProps?: DialogFooterProps;
};

export function Modal({
    id,
    children,
    title,
    description,
    actions,
    trigger,
    contentProps,
    bodyProps,
    footerProps,
    ...props
}: ModalProps) {
    const { close, isOpen, set } = useModalState();
    const open = id ? (isOpen(id) || props.open) : props.open;
    const contentClassName = contentProps?.className;
    const bodyClassName = bodyProps?.className;
    const footerClassName = footerProps?.className;
    const renderedTrigger = !trigger
        ? null
        : isValidElement(trigger) && trigger.type === DialogTrigger
            ? trigger
            : (
                <DialogTrigger asChild={isValidElement(trigger)}>
                    {trigger}
                </DialogTrigger>
            );

    useEffect(() => {
        if (id) set({ [id]: false, });
    }, [id, set]);

    return (
        <>
            <Dialog 
                {...props}
                open={open}
                onOpenChange={open => {
                    if (id) set({ [id]: open, });
                    props?.onOpenChange?.(open);
                }}
            >
                {renderedTrigger}

                <DialogContent 
                    {...contentProps}
                    hideCloseButton
                    className={cn(
                        '!flex min-h-0 max-h-[90dvh] flex-col overflow-hidden gap-y-4 p-0 m-0 sm:max-w-xl',
                        contentClassName,
                    )}
                >
                    <DialogHeader 
                        className={cn(
                            !title && !description ? 'hidden' : '',
                            'shrink-0 border-b border-b-border px-4 py-4',
                        )}
                    >
                        <DialogTitle
                            className={cn(title ? '' : 'hidden')}
                        >
                            {title}
                        </DialogTitle>

                        <DialogDescription 
                            className={cn(description ? '' : 'hidden')}
                        >
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        {...bodyProps}
                        className={cn(
                            "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-2",
                            bodyClassName,
                        )}
                    >
                        {children}
                    </div>
                    
                    <DialogFooter 
                        {...footerProps}
                        className={cn(
                            'shrink-0 border-t border-t-border px-4 py-2 items-center w-full',
                            actions ? '' : 'hidden',
                            footerClassName
                        )}
                    >
                        {actions}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
