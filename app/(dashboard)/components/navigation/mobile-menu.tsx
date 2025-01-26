'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { useRoutes } from "@/hooks/use-routes"
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo";

export function MobileMenu() {
    const pathname = usePathname();
    const routes = useRoutes();

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        className="lg:hidden"
                        variant="ghost"
                    >
                        <MenuIcon className="h-6 w-6 hover:text-primary-foreground" />
                    </Button>
                </SheetTrigger>

                <SheetContent 
                    side="left"
                    className="p-0 m-0 flex flex-col gap-y-6"
                >
                    <SheetHeader>
                        <SheetTitle className="flex justify-center py-5">
                            <Logo size="lg" href="/" />
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col">
                        {routes.map((route, i) => {
                            const isActive = pathname === route.href;

                            return (
                                <SheetClose key={i} asChild>
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            'p-4 flex flex-col justify-center transition-colors dark:text-foreground',
                                            isActive ? 
                                                'bg-primary text-primary-foreground' 
                                                : 
                                                'text-secondary hover:bg-primary/10 dark:hover:bg-primary-foreground/10'
                                        )}
                                    >
                                        {route.label}
                                    </Link>
                                </SheetClose>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
