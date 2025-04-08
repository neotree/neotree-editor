'use client';

import { DataTable } from "@/components/data-table";
import { dataKeys } from "@/databases/pg/_data-keys";
import { DataKey } from "@/databases/queries/data-keys";

type Props = {
    dataKeys: DataKey[];
};

export function DataKeysTable({ dataKeys }: Props) {
    return (
        <>
            <div>
                <DataTable 
                    selectedIndexes={[]}
                    onSelect={() => {}}
                    title="Data keys"
                    selectable={false}
                    sortable={false}
                    loading={false}
                    maxRows={undefined}
                    onSort={() => {}}
                    getRowOptions={() => ({})}
                    // search={{
                    //     inputPlaceholder: 'Search data keys',
                    // }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No data keys saved.</div>
                        </div>
                    )}
                    columns={[
                        {
                            name: 'Key',
                        },
                        {
                            name: 'Label',
                        },
                        {
                            name: 'Data type',
                        },
                        {
                            name: '',
                            align: 'right',
                            cellClassName: 'w-10',
                        },
                    ]}
                    data={dataKeys.map(key => [
                        key.name || '',
                        key.label || '',
                        key.dataType || '',
                    ])}
                />
            </div>
        </>
    );
}
