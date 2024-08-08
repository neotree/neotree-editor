'use client';

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

export type ModalProps = DialogProps & {
    children?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    trigger?: React.ReactNode;
    contentProps?: DialogContentProps;
    footerProps?: DialogFooterProps;
};

export function Modal({
    children,
    title,
    description,
    actions,
    trigger,
    contentProps,
    footerProps,
    ...props
}: ModalProps) {
    return (
        <>
            <Dialog {...props}>
                {trigger}

                <DialogContent 
                    hideCloseButton
                    className={cn(
                        'flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl',
                        contentProps?.className,
                    )}
                    {...contentProps}
                >
                    <DialogHeader 
                        className={cn(
                            !title && !description ? 'hidden' : '',
                            'border-b border-b-border px-4 py-4',
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

                    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2">
                        {children}
                    </div>
                    
                    <DialogFooter 
                        className={cn(
                            'border-t border-t-border px-4 py-2 items-center w-full',
                            actions ? '' : 'hidden',
                            footerProps?.className
                        )}
                        {...footerProps}
                    >
                        {actions}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
