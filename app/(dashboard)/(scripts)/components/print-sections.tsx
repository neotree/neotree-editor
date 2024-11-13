import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import queryString from "query-string";
import { MoreVertical, Trash, Edit, Eye, Plus, Edit2 } from "lucide-react"
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { listScreens } from "@/app/actions/scripts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { PrintSection } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptForm } from "../hooks/use-script-form";
import { Loader } from "@/components/loader";

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
            <Form
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

function Form({ disabled, section, onChange }: {
    disabled?: boolean;
    section?: PrintSection;
    onChange: (section: PrintSection) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(section?.title || '');
    const [screens, setScreens] = useState<Awaited<ReturnType<typeof listScreens>>['data']>([]);
    const [selected, setSelected] = useState(section?.screensIds || []);

    const { alert } = useAlertModal();

    const router = useRouter();
    const { scriptId } = useParams();
    const searchParams = useSearchParams(); 
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { printSectionId, addPrintSection } = searchParamsObj;

    useEffect(() => {
        setOpen(!!printSectionId || !!addPrintSection);
    }, [printSectionId, addPrintSection]);

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

    const onClose = useCallback(() => {
        setOpen(false);
        setTitle('');
        setSelected([]);

        router.push(`?${queryString.stringify({ 
            ...searchParamsObj, 
            printSectionId: undefined, 
            addPrintSection: undefined, 
        })}`);

        const scrollPos = containerRef.current?.getBoundingClientRect()?.top || 0;
        setTimeout(() => window.scrollTo({ top: scrollPos, }), 500);
    }, [searchParamsObj, router.push]);

    useEffect(() => {
        (async () => {
            if (open && !screens.length) {
                try {
                    setLoading(true);
                    const res = await axios.get<Awaited<ReturnType<typeof listScreens>>>('/api/screens/list?data='+JSON.stringify({ scriptsIds: [scriptId], }));
                    const { data, errors } = res.data;
                    if (errors?.length) throw new Error(errors.join(', '));
                    setScreens(data);
                } catch(e: any) {
                    alert({
                        title: '',
                        message: 'Error: ' + e.message,
                        variant: 'error',
                    });
                } finally {
                    setLoading(false);
                }
            }
        })();
    }, [scriptId, screens, open, alert]);

    if (loading) return <Loader overlay />;

    return (
        <div ref={containerRef}>
            <Sheet
                open={open}
                onOpenChange={open => {
                    if (!open) onClose();
                }}
            >
                <SheetContent
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle>{addPrintSection ? 'Add' : ''}{printSectionId ? 'Edit' : ''} print section</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
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

                            <Select
                                value=""
                                name="screenId"
                                onValueChange={val => {
                                    if (val) setSelected(prev => [...prev, val])
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select screen" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">None</SelectItem>
                                    {screens.map(s => {
                                        const disabled = selected.includes(s.screenId);
                                        return (
                                            <SelectItem key={s.screenId} disabled={disabled} value={s.oldScreenId || s.screenId}>
                                                <div 
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: [
                                                            s.position,
                                                            s.title,
                                                            `<span class="opacity-50">${s.refId || ''}</span>`,
                                                        ].join(' - '),
                                                    }}
                                                />
                                            </SelectItem>
                                        );
                                    })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <DataTable 
                                columns={[
                                    {
                                        name: 'Position'
                                    },
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
                                data={screens.filter(s => selected.includes(s.screenId)).map(s => [
                                    s.position,
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
    );
}