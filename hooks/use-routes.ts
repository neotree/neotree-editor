import { usePathname } from "next/navigation";
import { v4 } from "uuid";

import { useAppContext } from "@/contexts/app";

export function useRoutes() {
    const pathname = usePathname();
    const { isDefaultUser, isSuperUser, sys } = useAppContext();

    return [
        {
            label: 'Scripts',
            href: '/',
            isActive: pathname.substring(0, 8) === '/script/',
            id: v4(),
            hidden: false,
        },
        {
            label: 'Configuration',
            href: '/configuration',
            id: v4(),
            hidden: false,
        },
        {
            label: 'Hospitals',
            href: '/hospitals',
            id: v4(),
            hidden: false,
        },
        {
            label: 'Users',
            href: '/users',
            id: v4(),
            hidden: isDefaultUser,
        },
        {
            label: 'Settings',
            href: '/settings',
            isActive: pathname.substring(0, 9) === '/settings/',
            id: v4(),
            hidden: !isSuperUser,
        },
    ]
        .filter(route => !route.hidden)
        .map(route => ({
            ...route,
            isActive: route.isActive || (pathname === route.href),
        }));
}
