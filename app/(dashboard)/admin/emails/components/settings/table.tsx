'use client';

import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { useMailerContext } from "@/contexts/mailer";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { BottomActions } from "./bottom-actions";
import { MailerSettingsTableActions } from "./table-actions";
import { Form } from "./form";
import { TestEmailForm } from "./test-email-form";

export function MailerSettingsTable() {
    const {
        loading,
        selected,
        mailerSettings,
        activeItemId,
        setSelected,
    } = useMailerContext();

    const activeItem = useMemo(() => !activeItemId ? null :mailerSettings.data.filter(t => t.id === activeItemId)[0], [activeItemId,mailerSettings]);

    return (
        <>
            {loading && <Loader overlay />}

            <div className="">
                <DataTable 
                    selectable
                    selectedIndexes={selected}
                    onSelect={setSelected}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No mailer settings saved. To add settings, click:</div>
                            <Form />
                        </div>
                    )}
                    getRowOptions={({ rowIndex }) => {
                        const s = mailerSettings.data[rowIndex];
                        return {
                            className: s?.isActive ? 'bg-primary/20 hover:bg-primary/30' : '',
                        };
                    }}
                    columns={[
                        {
                            name: 'Name',
                        },
                        {
                            name: 'Service',
                            align: 'right',
                            cellClassName: 'w-20',
                        },
                        {
                            name: 'Status',
                            align: 'right',
                            cellClassName: 'w-20',
                            cellRenderer({ value, }) {
                                return (
                                    <div className="inline-flex items-center gap-x-1">
                                        <div className={cn('w-2 h-2 rounded-full', value ? 'bg-green-400' : 'bg-gray-300')} />
                                        <span>active</span>
                                    </div>
                                );
                            },
                        },
                        {
                            name: 'Action',
                            align: 'right',
                            cellClassName: 'w-10',
                            cellRenderer({ rowIndex, }) {
                                const s = mailerSettings.data[rowIndex];
                                if (!s) return null;
                                return (
                                    <MailerSettingsTableActions 
                                        item={s}
                                    />
                                );
                            },
                        },
                    ]}
                    data={mailerSettings.data.map(s => [
                        s.name,
                        s.service,
                        s.isActive ? 1 : 0,
                        '',
                    ])}
                />
            </div>

            <TestEmailForm />

            {!!mailerSettings.data.length && (
                <div className="fixed bottom-5 right-10">
                    <Form />
                </div>
            )}

            <BottomActions />

            {!!activeItem && <Form formData={activeItem} open />}
        </>
    )
}
