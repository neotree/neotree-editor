'use client';

import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { getScriptsDataKeys } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { PageContainer } from "../../../components/page-container";

export function ScriptDataKeysTable({ data: { title, keys, }, }: {
    data: Awaited<ReturnType<typeof getScriptsDataKeys>>['data']['scripts'][0];
}) {
    return (
        <>
            <Title>{title + ' - data keys'}</Title>
            <PageContainer>
                <div className="p-4 text-2xl">{title}</div>
                <DataTable 
                    search={{ inputPlaceholder: 'Search', }}
                    getRowOptions={({ rowIndex, }) => {
                        const key = keys[rowIndex];

                        return {
                            className: cn(!key?.uniqueKey && 'bg-red-400/20 hover:bg-red-400/30'),
                        };
                    }}
                    columns={[
                        {
                            name: 'Key',
                        },
                        {
                            name: 'Label',
                        },
                        {
                            name: 'Type',
                        },
                        {
                            name: '',
                            cellRenderer({ rowIndex, }) {
                                const key = keys[rowIndex];

                                if (!key?.uniqueKey) return null;

                                return (
                                    <div className="flex items-center gap-x-2">
                                        <Link href={`/data-keys/edit/${key.uniqueKey}`}>
                                            <ExternalLinkIcon className="text-primary w-4 h-4" />
                                        </Link>
                                    </div>
                                )
                            },
                        },
                    ]}
                    data={keys.map(k => [
                        k.name,
                        k.label,
                        k.dataType,
                        '',
                    ])}
                />
            </PageContainer>
        </>
    )
}
