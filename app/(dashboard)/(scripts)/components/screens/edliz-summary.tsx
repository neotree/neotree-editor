'use client';

import { useMemo } from "react";

import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/data-table";
import { ScriptItem } from '@/types';
import { useScreenForm } from "../../hooks/use-screen-form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
};

export function EdlizSummary({
    form: {
        watch,
    },
}: Props) {
    const items = watch('items');

    const sections = useMemo(() => {
        return items.reduce((acc, item) => {
            if (item.type) {
                acc[item.type] = acc[item.type] || [];
                acc[item.type].push(item);
            }
            return acc;
        }, {} as { [key: string]: ScriptItem[]; });
    }, [items]);
    
    return (
        <>
            {Object.keys(sections).map(key => {
                const data = sections[key];
                return (
                    <div key={key}>
                        <Separator />
                        <div className="mt-5">
                            <DataTable 
                                title={key}
                                columns={[
                                    {
                                        name: 'ID',
                                        cellClassName: 'w-[150px]',
                                    },
                                    {
                                        name: 'Sub type',
                                        cellClassName: 'w-[150px]',
                                    },
                                    {
                                        name: 'Label',
                                    },
                                ]}
                                data={data.map(item => [
                                    item.id || '',
                                    item.subType || '',
                                    item.label || '',
                                ])}
                            />
                        </div>
                    </div>
                );
            })}
        </>
    );
}
