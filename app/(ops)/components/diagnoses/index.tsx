'use client';

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { TableColumn } from "@/components/data-table/types";
import { Image } from "@/components/image";
import { useFilters } from "../use-filters";
import { Header } from "../header";

type Props = ReturnType<typeof useFilters>;

export function Diagnoses(props: Props) {
    const {
        diagnoses,
        diagnosesColumns,
        setDiagnosesColumns,
    } = props;

    const columns = useMemo(() => {
        return Object.keys({ ...diagnoses.data[0] }).map(_key => {
            const key = _key as keyof typeof diagnoses.data[0];
            return key;
        });
    }, [diagnoses.data[0]]);

    return (
        <>
            <Header {...props}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Columns
                            <ChevronDown className="ml-auto h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        className="max-h-[400px]"
                    >
                        <DropdownMenuLabel>Diagnoses</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className=" max-h-[400px] overflow-y-auto">
                            {columns.map(col => {
                                const checked = diagnosesColumns.includes(col);
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={col}
                                        checked={checked}
                                        onCheckedChange={() => {
                                            setDiagnosesColumns(prev => checked ? prev.filter(v => v !== col) : [...prev, col]);
                                        }}
                                    >
                                        {col}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Header>

            <DataTable 
                columns={[
                    {
                        name: '',
                        cellClassName: 'hidden',
                    },
                    ...columns.map(_key => {
                        const key = _key as keyof typeof diagnoses.data[0];
                        return {
                            name: key,
                            cellClassName: cn(
                                'truncate max-w-[200px]',
                                !diagnosesColumns.includes(key) && 'hidden',
                            ),
                            cellRenderer({ value, rowIndex }) {
                                const diagnosis = diagnoses.data[rowIndex];

                                let image: typeof diagnosis.image1 = null;

                                if (key === 'image1') image = diagnosis.image1;
                                if (key === 'image2') image = diagnosis.image2;
                                if (key === 'image3') image = diagnosis.image3;

                                if (image) {
                                    return (
                                        <div className="w-10 h-10">
                                            <Image alt={diagnosis.diagnosisId} src={image.data} />
                                        </div>
                                    );
                                };

                                return value;
                            },
                        } as TableColumn;
                    }),
                ]}
                data={diagnoses.data.map(s => {
                    return [
                        '',
                        ...columns.map(_key => {
                            const key = _key as keyof typeof diagnoses.data[0];
                            const value = s[key];
                            
                            if ((value !== null) && (typeof value === 'object')) return typeof value;

                            return `${value}`;
                        }),
                    ];
                })}
            />
        </>
    );
}
