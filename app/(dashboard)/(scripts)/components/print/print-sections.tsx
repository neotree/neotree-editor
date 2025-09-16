import { useCallback } from "react";
import { MoreVertical, Trash, Edit, Eye, Plus } from "lucide-react"
import { arrayMoveImmutable } from 'array-move';
import { useQueryState } from 'nuqs';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useScriptForm } from "../../hooks/use-script-form";
import { PrintForm } from "./print-sections-form";

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

    const onDelete = useCallback((sectionId: string) => {
        setValue('printSections', sections.filter(s => s.sectionId !== sectionId));
    }, [sections, setValue]);

    const [currentSection, setCurrentSection] = useQueryState('item', {
        defaultValue: '',
        clearOnDefault: true,
    });

    return (
        <>
            <PrintForm
                open={!!currentSection}
                onClose={() => setCurrentSection('')}
                disabled={disabled}
                section={sections.filter(s => `${s.sectionId}` === `${currentSection}`)[0]}
                onChange={section => (currentSection === 'new') ? 
                    setValue('printSections', [...sections, section])
                    :
                    setValue('printSections', sections.map(s => {
                        if (s.sectionId !== section.sectionId) return s;
                        return { ...s, ...section, };
                    }))
                }
            />

            <DataTable 
                sortable={!disabled}
                onSort={(oldIndex: number, newIndex: number) => {
                    const arr = arrayMoveImmutable(sections, oldIndex, newIndex);
                    setValue('printSections', arr);
                }}
                headerActions={(
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentSection('new')}
                        >
                            Add print section
                            <Plus className="w-4 h-4 ml-2" />
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
                                                onClick={() => {
                                                    setTimeout(() => setCurrentSection(`${section.sectionId}`), 0);
                                                }}
                                            >
                                                {!disabled ? 
                                                    <><Edit className="mr-2 h-4 w-4" /> Edit</> 
                                                    : 
                                                    <><Eye className="mr-2 h-4 w-4" /> View</>}
                                            </DropdownMenuItem>

                                            {!disabled && (
                                                <DropdownMenuItem
                                                    onClick={() => setTimeout(() => onDelete(section.sectionId), 0)}
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
