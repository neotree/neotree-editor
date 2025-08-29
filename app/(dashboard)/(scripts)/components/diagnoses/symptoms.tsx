import { useCallback, useState, useRef } from "react";
import { arrayMoveImmutable } from "array-move";
import { Plus, MoreVertical, Trash, Edit, Copy } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { SymptomsBottomActions } from "./symptoms-bottom-actions";
import { Symptom } from "./symptom";
import { useDiagnosisForm } from "../..//hooks/use-diagnosis-form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useDiagnosisForm>;
};

export function Symptoms({
    form,
    disabled,
}: Props) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const { confirm } = useConfirmModal();

    const symptoms = form.watch('symptoms');

    const onSort = useCallback((oldIndex: number, newIndex: number) => {
        const data = arrayMoveImmutable([...symptoms], oldIndex, newIndex);
        form.setValue(
            'symptoms',
            data.map((s, i) => ({
                ...s,
                position: i + 1,
            })),
            { shouldDirty: true, }
        );
    }, [form, symptoms]);

    const onDelete = useCallback((indexes: number[]) => {
        const labels = symptoms.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold text-danger">${s.name}</div>`).join('');
        confirm(() => {
            const data = symptoms.filter((_, i) => !indexes.includes(i));
            form.setValue(
                'symptoms',
                data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })),
                { shouldDirty: true, }
            );
            setSelectedIndexes([]);
        }, {
            title: 'Delete',
            message: `<p>Are you sure you want to delete ${indexes.length > 1 ? `${indexes.length} symptoms: ` : 'symptom: '}</p> ${labels}`,
            danger: true,
            positiveLabel: 'Delete',
        });
    }, [form, symptoms, confirm]);

    const onCopy = useCallback((indexes: number[]) => {
        const labels = symptoms.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold">${s.name}</div>`).join('');
        confirm(() => {
            const data = [
                ...symptoms,
                ...symptoms.filter((_, i) => indexes.includes(i)).map((f, i) => ({
                    ...f,
                    position: symptoms.length + 1 + i,
                })),
            ];
            form.setValue(
                'symptoms',
                data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })),
                { shouldDirty: true, }
            );
            setSelectedIndexes([]);
        }, {
            title: 'Duplicate',
            message: `<p>Are you sure you want to duplicate ${indexes.length > 1 ? `${indexes.length} symptoms: ` : 'symptom: '}</p> ${labels}`,
            positiveLabel: 'Duplicate',
        })
    }, [form, symptoms, confirm]);

    return (
        <>
            <button ref={btnRef} />

            <DataTable 
                title="Symptoms"
                sortable={!disabled}
                selectable={!disabled}
                onSort={onSort}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                search={{
                    inputPlaceholder: 'Search symptoms',
                }}
                headerActions={(
                    <>
                        <Symptom
                            form={form}
                            disabled={disabled}
                        >
                            {!disabled && (
                                <DialogTrigger asChild>
                                    <Button className="text-primary border-primary" variant="outline">
                                        <Plus className="h-4 w-4 mr-1" />
                                        New symptom
                                    </Button>
                                </DialogTrigger>
                            )}
                        </Symptom>
                    </>
                )}
                columns={[
                    {
                        name: 'Type',
                    },
                    {
                        name: 'Name',
                    },
                    {
                        name: 'Action',
                        align: 'right',
                        cellRenderer({ rowIndex }){
                            const symptom = symptoms[rowIndex];

                            return (
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
                                        <DropdownMenuItem asChild>
                                            <Symptom 
                                                disabled={disabled} 
                                                form={form}
                                                symptom={{
                                                    data: symptom,
                                                    index: rowIndex,
                                                }}
                                            >
                                                {({ extraProps }) => (
                                                    <DialogTrigger 
                                                        {...extraProps}
                                                        className={cn(extraProps?.className, 'w-full')}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        <span>{disabled ? 'View' : 'Edit'}</span>
                                                    </DialogTrigger>
                                                )}
                                            </Symptom>
                                        </DropdownMenuItem>

                                        {/* <DropdownMenuSymptom 
                                            disabled={disabled} 
                                            onClick={() => onCopy([rowIndex])}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            <span>Duplicate</span>
                                        </DropdownMenuSymptom> */}

                                        <DropdownMenuItem
                                            onClick={() => {
                                                btnRef.current?.click?.();
                                                setTimeout(() => onDelete([rowIndex]), 0);
                                            }}
                                            className={cn(
                                                'text-danger focus:bg-danger focus:text-danger-foreground',
                                            )}
                                            disabled={disabled}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }
                    },
                ]}
                data={symptoms.map(f => [
                    f.type,
                    f.name,
                    '',
                ])}
            />

            {!disabled && (
                <SymptomsBottomActions 
                    disabled={disabled}
                    selected={selectedIndexes}
                    onDelete={() => onDelete(selectedIndexes)}
                    onCopy={() => onCopy(selectedIndexes)}
                />
            )}
        </>
    );
}
