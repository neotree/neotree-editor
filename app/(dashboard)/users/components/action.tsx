'use client';

import { useSession } from "next-auth/react";
import { MoreVertical, Trash } from "lucide-react"
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
    disabled?: boolean;
    onDelete: () => void;
    onResetPasswords: () => void;
};

export function UserAction({ 
    email,
    userId,
    userName, 
    isActivated, 
    disabled: disabledProp,
    onDelete, 
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
                        disabled={isActivated}
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

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setTimeout(() => onDelete(), 0)}
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        disabled={disabled || (email === session.data?.user?.email)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
