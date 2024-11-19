'use client';

import { useState } from "react";

import { PopoverSelect } from "@/components/popover-select";

type HeaderProps = {
    columns: string[];
};

export function Header({
    columns,
}: HeaderProps) {
    const [filters, setFilters] = useState({
        scripts: [],
        columns,
    });

    return (
        <>
            <div className="h-[60px]" />

            <div
                className="
                    fixed
                    top-0
                    left-0
                    w-full
                    h-[60px]
                    bg-white
                    border-b
                    flex
                    flex-col
                    justify-center
                "
            >
                <div
                    className="
                        flex
                        items-center
                        px-4
                    "
                >
                    <span className="text-xl font-bold">Screens</span>

                    <div className="flex-1" />

                    <div>
                        <PopoverSelect
                            placeholder="Columns"
                            selectMultiple
                            value={filters.columns}
                            options={columns.map(c => {
                                return {
                                    label: c,
                                    value: c,
                                };
                            })}
                            onChange={selected => setFilters(prev => ({
                                ...prev,
                                columns: selected as string[],
                            }))}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
