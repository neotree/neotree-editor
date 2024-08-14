'use client';

import { useCallback } from "react";
import { LogOut, User as UserIcon, } from "lucide-react"
import Link from "next/link";
import { signOut } from "next-auth/react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAppContext, IAppContext } from "@/contexts/app";
import { cn } from "@/lib/utils";

type Props = {
    user: IAppContext['authenticatedUser'];
};

export function User({ user }: Props) {
    const { sys } = useAppContext();
    
    const { confirm } = useConfirmModal();

    const onSignOut = useCallback(() => {
        confirm(() => signOut({ callbackUrl: '/login', redirect: true, }), {
            title: 'Log out',
            message: 'Are you sure you want to log out?',
            negativeLabel: 'Cancel',
            positiveLabel: 'Log out',
        });
    }, [confirm]);

    const usePlainBg = sys.data.use_plain_background === 'yes';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                            'transition-colors rounded-full hover:text-primary-foreground hover:bg-primary h-12 w-12',
                            usePlainBg ? '' : 'text-primary-foreground hover:bg-primary-foreground/20',
                        )}
                    >
                        <UserIcon className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className={cn(sys.data.hide_account_settings_page === 'yes' && 'hidden')}>
                        <Link href="/account">
                            Account settings
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={onSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
