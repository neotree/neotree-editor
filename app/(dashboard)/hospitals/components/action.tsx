'use client';

import { MoreVertical, Trash } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getHospitals } from "@/app/actions/hospitals";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";
import { useAppContext } from "@/contexts/app";

type Props = {
    hospital: Awaited<ReturnType<typeof getHospitals>>['data'][0];
    onDelete: () => void;
};

export function HospitalAction({ 
    hospital: {
        hospitalId,
        isDraft,
        draftCreatedByUserId, 
    },
    onDelete, 
}: Props) {
    const searchParams = useSearchParams();

    const lockStatusParams: LockStatusProps = {
        isDraft: isDraft,
        userId: draftCreatedByUserId,
        dataType: 'hospital',
    };

    const isLocked = useIsLocked(lockStatusParams);
    const { viewOnly } = useAppContext();

    const disabled = viewOnly || isLocked;

    return (
        <>
            <div className="flex gap-x-2 w-[100px] justify-end">
                <LockStatus {...lockStatusParams} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuItem 
                            onClick={() => searchParams.push({ hospitalId })}
                        >
                            {disabled ? 'View' : 'Edit'}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            disabled={disabled}
                            onClick={() => setTimeout(() => onDelete(), 0)}
                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
