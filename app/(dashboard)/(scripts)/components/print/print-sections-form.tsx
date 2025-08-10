import { useCallback, useEffect, useState } from "react";
import { MoreVertical, Trash } from "lucide-react"
import { v4 as uuidv4 } from "uuid";
import { useMeasure } from "react-use";
import { arrayMoveImmutable } from 'array-move';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { PrintSection } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/loader";
import { ReactSelect } from "@/components/react-select";
import { useScriptsContext } from "@/contexts/scripts";

export function PrintForm({ open, disabled, section, onClose, onChange }: {
    open: boolean;
    disabled?: boolean;
    section?: PrintSection;
    onClose: () => void;
    onChange: (section: PrintSection) => void;
}) {
    const [containerDivRef, containerDiv] = useMeasure<HTMLDivElement>();
    const [contentDivRef, contentDiv] = useMeasure<HTMLDivElement>();

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(section?.title || '');
    const [selected, setSelected] = useState(section?.screensIds || []);

    const { screens: { data: screens, } } = useScriptsContext();

    useEffect(() => {
        setTitle(section?.title || '');
        setSelected(section?.screensIds || []);
    }, [section]);

    const onSave = useCallback(() => {
        onChange({
            ...section,
            screensIds: selected,
            title,
            sectionId: section?.sectionId || uuidv4(),
        });
    }, [selected, title, section, onChange]);

    const _onClose = useCallback(() => {
        setTitle('');
        setSelected([]);
        const scrollPos = containerDiv?.top || 0;
        setTimeout(() => window.scrollTo({ top: scrollPos, }), 500);
        onClose();
    }, [containerDiv, onClose]);

    const getScreenLabel = useCallback((screen: typeof screens[0]) => {
        return [
            screen.position,
            screen.title,
            screen.refId || '',
        ].join(' - ');
    }, []);

    const selectOpts = screens.map(s => ({
        value: s.screenId,
        label: getScreenLabel(s),
    })).filter(s => !selected.includes(s.value));

    return (
        <>
            {loading && <Loader overlay />}

            <div ref={containerDivRef}>
                <Sheet
                    open={open}
                    onOpenChange={open => {
                        if (!open) _onClose();
                    }}
                >
                    <SheetContent
                        hideCloseButton
                        side="right"
                        className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                    >
                        <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                            <SheetTitle>{!section ? 'Add' : 'Edit'} print section</SheetTitle>
                            <SheetDescription className="hidden"></SheetDescription>
                        </SheetHeader>

                        <div ref={contentDivRef} className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                            <div className="px-4">
                                <Label secondary htmlFor="scriptPrintSectionTitle">Title *</Label>
                                <Input
                                    name="scriptPrintSectionTitle"
                                    className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="px-4">
                                <Label secondary>Screens</Label>

                                <div>
                                    <ReactSelect
                                        isDisabled={disabled}
                                        value={null}
                                        placeholder="Select screen"
                                        isClearable={false}
                                        options={selectOpts}
                                        onChange={(val) =>
                                        {
                                            const v = val as null | typeof selectOpts[0];
                                            if (v?.value) setSelected(prev => [...prev, v.value]);
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <DataTable 
                                    sortable={!disabled}
                                    onSort={(oldIndex: number, newIndex: number) => {
                                        const arr = arrayMoveImmutable(selected, oldIndex, newIndex);
                                        setSelected(arr);
                                    }}
                                    columns={[
                                        {
                                            name: 'Screen title'
                                        },
                                        {
                                            name: 'Ref'
                                        },
                                        {
                                            name: '',
                                            align: 'right',
                                            cellRenderer({ value, }) {
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
                                                                    disabled={disabled}
                                                                    className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                                    onClick={() => setSelected(prev => prev.filter(id => id !== value))}
                                                                >
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    <span>Delete</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </>
                                                );
                                            },
                                        },
                                    ]}
                                    data={selected
                                        .map(screenId => screens.filter(s => s.screenId === screenId)[0])
                                        .filter(s => s)
                                        .map(s => [
                                            s.title,
                                            s.refId,
                                            s.screenId
                                        ])}
                                />
                            </div>
                        </div>

                        <div className="border-t border-t-border px-4 py-2 flex gap-x-2">
                            <span className="text-danger text-xs my-auto">* Required</span>

                            <div className="ml-auto" />

                            <SheetClose asChild>
                                <Button
                                    variant="ghost"
                                    onClick={() => {}}
                                >
                                    Cancel
                                </Button>
                            </SheetClose>

                            <SheetClose asChild>
                                <Button
                                    onClick={() => onSave()}
                                    disabled={disabled || !title}
                                >
                                    Save
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
