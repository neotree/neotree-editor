'use client';

import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { useEmailTemplatesContext } from "@/contexts/email-templates";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { BottomActions } from "./bottom-actions";
import { EmailTemplatesTableActions } from "./table-actions";
import { Form } from "./form";

export function EmailTemplatesTable() {
    const {
        loading,
        selected,
        emailTemplates,
        activeItemId,
        setSelected,
    } = useEmailTemplatesContext();

    const activeItem = useMemo(() => !activeItemId ? null : emailTemplates.data.filter(t => t.id === activeItemId)[0], [activeItemId, emailTemplates]);

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
                            <div>No email templates saved. To add settings, click:</div>
                            <Form />
                        </div>
                    )}
                    columns={[
                        {
                            name: 'Name',
                        },
                        {
                            name: 'Action',
                            align: 'right',
                            cellClassName: 'w-10',
                            cellRenderer({ rowIndex, }) {
                                const s = emailTemplates.data[rowIndex];
                                if (!s) return null;
                                return (
                                    <EmailTemplatesTableActions 
                                        item={s}
                                    />
                                );
                            },
                        },
                    ]}
                    data={emailTemplates.data.map(s => [
                        s.name,
                        '',
                    ])}
                />
            </div>

            {!!emailTemplates.data.length && (
                <div className="fixed bottom-5 right-10">
                    <Form />
                </div>
            )}

            {!!activeItem && <Form formData={activeItem} open />}

            <BottomActions />
        </>
    )
}
