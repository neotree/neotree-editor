'use client';

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
