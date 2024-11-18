import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import { MoreVertical, Trash, Edit, Eye, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useScriptForm } from "../../hooks/use-script-form";
import { PrintForm } from "./form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

export function PrintSections({
    disabled,
    form: {
        watch,
        setValue,
    },
}: Props) {
    const sections = watch('printSections');

    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { printSectionId } = searchParamsObj;

    const onDelete = useCallback((sectionId: string) => {
        setValue('printSections', sections.filter(s => s.sectionId !== sectionId));
    }, [sections, setValue]);

    return (
        <>
            <PrintForm
                disabled={disabled}
                section={sections.filter(s => s.sectionId === printSectionId)[0]}
                onChange={section => !printSectionId ? 
                    setValue('printSections', [...sections, section])
                    :
                    setValue('printSections', sections.map(s => {
                        if (s.sectionId !== section.sectionId) return s;
                        return { ...s, ...section, };
                    }))
                }
            />

            <DataTable 
                headerActions={(
                    <>
                        <Button
                            asChild
                            variant="outline"
                        >
                            <Link
                                href={`?${queryString.stringify({ 
                                    ...searchParamsObj,
                                    addPrintSection: 1,
                                })}`}
                            >
                                Add print section
                                <Plus className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </>
                )}
                columns={[
                    {
                        name: 'Print section title',
                    },
                    {
                        name: '',
                        align: 'right',
                        cellRenderer({ rowIndex }) {
                            const section = sections[rowIndex];

                            if (!section) return null;

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
                                            >
                                                <Link
                                                    href={`?${queryString.stringify({ ...searchParamsObj, printSectionId: section.sectionId, })}`}
                                                >
                                                    <>
                                                        {!disabled ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                                                    </>
                                                </Link>
                                            </DropdownMenuItem>

                                            {!disabled && (
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(section.sectionId)}
                                                    className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            );
                        },
                    }
                ]}
                data={sections.map(s => [
                    s.title,
                ])}
            />
        </>
    );
}
