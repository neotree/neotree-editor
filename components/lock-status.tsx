'use client';

import { forwardRef, useCallback, useImperativeHandle } from "react";
import { LockIcon } from "lucide-react"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useIsLocked } from "@/hooks/use-is-locked";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { useUser } from "@/hooks/use-user";

export type LockStatusProps = {
    isDraft: boolean;
    userId?: string | null;
    dataType?: string;
};

export type LockStatusRef = {
    isLocked: boolean;
};

const LockStatus = forwardRef<LockStatusRef, LockStatusProps>(({ isDraft, userId, dataType, }, ref) => {
    const isLocked = useIsLocked({ isDraft, userId });

    useImperativeHandle(ref, () => ({ isLocked, }), [isLocked]);

    const { loading, error, user, getUser, } = useUser({
        userId,
        loadOnMount: false,
    });

    const onOpenChange = useCallback(async (open: boolean) => {
        if (open && !loading && !user && userId) {
            getUser();
        }
    }, [userId, user, loading]);

    return (
        <>
            <Popover onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <button disabled={!isLocked}>
                        <LockIcon 
                            className={cn(
                                'w-4 h-4 text-destructive/80',
                                !isLocked && 'opacity-0', 
                            )}
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 text-sm max-w-[200px]">
                    {loading ? (
                        <div className="p-2 flex justify-center">
                            <Loader padding={0} />
                        </div>
                    ) : (
                        (error || !user) ? (
                            <div className="p-2 text-destructive bg-destructive/20">
                                {error || 'Failed to load user!'}
                            </div>
                        ) : (
                            <div className="p-2">
                                <strong>{user.displayName}</strong> is working on this {dataType || ''}
                            </div>
                        )
                    )}
                </PopoverContent>
            </Popover>
        </>
    );
});

LockStatus.displayName = 'LockStatus';

export { LockStatus };
