'use client';

import { useSession } from "next-auth/react";
import { MoreVertical, UserCheck, UserX } from "lucide-react"
import Link from "next/link";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { useAppContext } from "@/contexts/app";

type Props = {
    email: string;
    userId: string;
    userName: string;
    isActivated: boolean;
    isDeactivated: boolean;
    disabled?: boolean;
    onDeactivate: () => void;
    onReactivate: () => void;
    onViewHistory: () => void;
    onResetPasswords: () => void;
};

export function UserAction({ 
    email,
    userId,
    userName, 
    isActivated, 
    isDeactivated,
    disabled: disabledProp,
    onDeactivate,
    onReactivate,
    onViewHistory,
    onResetPasswords,
}: Props) {
    const session = useSession();
    const { viewOnly } = useAppContext();

    const disabled = !!disabledProp || viewOnly;

    return (
        <>
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
                    <DropdownMenuLabel>{userName}</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                        asChild
                    >
                        <Link href={`/users/edit/${userId}`}>
                            {disabled ? "View" : "Edit"}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        disabled={isActivated || isDeactivated}
                    >
                        Send activation code
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={disabled}
                        onClick={() => setTimeout(() => onResetPasswords(), 0)}
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                    >
                        Reset password
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setTimeout(() => onViewHistory(), 0)}>
                        Access history
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {isDeactivated ? (
                        <DropdownMenuItem
                            onClick={() => setTimeout(() => onReactivate(), 0)}
                            disabled={disabled}
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Reactivate</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => setTimeout(() => onDeactivate(), 0)}
                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                            disabled={disabled || (email === session.data?.user?.email)}
                        >
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Deactivate</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
