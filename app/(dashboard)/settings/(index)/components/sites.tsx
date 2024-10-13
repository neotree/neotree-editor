'use client';

import Link from "next/link";
import { MoreVertical, Trash, Edit } from "lucide-react"
import { useSearchParams } from "next/navigation";

import * as sitesActions from '@/app/actions/sites';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Separator } from "@/components/ui/separator";
import { SiteForm } from "./site-form";

type Props = typeof sitesActions & {
    sites: Awaited<ReturnType<typeof sitesActions.getSites>>;
};

export function Sites(props: Props) {
    const { sites } = props;

    const searchParams = useSearchParams();
    const editSiteId = searchParams.get('editSiteId');

    const { confirm } = useConfirmModal();

    const onDelete = (ids: string[]) => {
        const data = sites.data.filter(s => ids.includes(s.siteId));
        confirm(() => {}, {
            danger: true,
            title: 'Delete site',
            message: 'Are you sure you want to delete:<br />' + data.map(s => `<b class="text-red-400">${s.name}</b><br />`).join(''),
        });
    }

    return (
        <>
            <DataTable 
                columns={[
                    {
                        name: 'Site',
                    },
                    {
                        name: 'Type',
                        align: 'right',

                    },
                    {
                        name: 'env',
                        align: 'right',
                        tdClassName: 'w-[100px]',

                    },
                    {
                        name: '',
                        align: 'right',
                        tdClassName: 'w-[50px]',
                        cellRenderer({ rowIndex }) {
                            const site = sites.data[rowIndex];

                            if (!site) return null;

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
                                            <DropdownMenuItem
                                                asChild
                                                onClick={() => {}}
                                            >
                                                <Link href={`/settings?editSiteId=${site.siteId}`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => onDelete([site.siteId])}
                                                className="text-danger focus:bg-danger focus:text-danger-foreground"
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            );
                        },
                    },
                ]}
                data={sites.data.map(site => [
                    site.name,
                    site.type,
                    site.env,
                    '',
                ])}
            />

            <Separator />

            {!!editSiteId && (
                <SiteForm 
                    {...props}
                    sites={sites.data}
                />
            )}
        </>
    );
}