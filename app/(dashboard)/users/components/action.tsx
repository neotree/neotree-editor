'use client';

import { useSession } from "next-auth/react";
import { MoreVertical, Trash } from "lucide-react"

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

type Props = {
    email: string;
    userId: string;
    userName: string;
    isActivated: boolean;
    onDelete: () => void;
    onResetPasswords: () => void;
};

export function UserAction({ 
    email,
    userId,
    userName, 
    isActivated, 
    onDelete, 
    onResetPasswords,
}: Props) {
    const session = useSession();

    const searchParams = useSearchParams();

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
                        onClick={() => searchParams.push({ userId })}
                    >
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        disabled={isActivated}
                    >
                        Send activation code
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={onResetPasswords}
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                    >
                        Reset password
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={onDelete}
                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                        disabled={email === session.data?.user?.email}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
