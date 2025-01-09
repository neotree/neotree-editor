import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import queryString from "query-string";
import { MoreVertical, Trash, ChevronDown } from "lucide-react"
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useMeasure } from "react-use";
import clsx from "clsx";

import { getScriptsMetadata, saveScriptsDrugs } from "@/app/actions/scripts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";

type Item = Parameters<typeof saveScriptsDrugs>[0]['data'][0]

const getDefaultForm = (item?: Item) => ({
    itemId: `${item?.itemId || uuidv4()}`,
    drug: `${item?.drug || ''}`,
    minGestation: `${item?.minGestation || ''}`,
    maxGestation: `${item?.maxGestation || ''}`,
    minWeight: `${item?.minWeight || ''}`,
    maxWeight: `${item?.maxWeight || ''}`,
    dayOfLife: `${item?.dayOfLife || ''}`,
    dosageText: `${item?.dosageText || ''}`,
    managementText: `${item?.managementText || ''}`,
    gestationKey: `${item?.gestationKey || ''}`,
    weightKey: `${item?.weightKey || ''}`,
});

export function DrugsLibraryForm({ disabled, item, onChange }: {
    disabled?: boolean;
    item?: Item;
    onChange: (item: Item) => void;
}) {
    const screensInitialised = useRef(false);

    const [containerDivRef, containerDiv] = useMeasure<HTMLDivElement>();
    const [contentDivRef, contentDiv] = useMeasure<HTMLDivElement>();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(getDefaultForm(item));
    const [keys, setKeys] = useState<string[]>([]);

    const { alert } = useAlertModal();

    const router = useRouter();
    const { scriptId } = useParams();
    const searchParams = useSearchParams(); 
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId, addDrug } = searchParamsObj;

    useEffect(() => {
        setOpen(!!itemId || !!addDrug);
    }, [itemId, addDrug]);

    useEffect(() => {
        setForm(getDefaultForm(item));
    }, [item]);

    const onSave = useCallback(() => {
        onChange({
            ...form,
            scriptId: scriptId as string,
            minWeight: Number(form.minWeight),
            maxWeight: Number(form.maxWeight),
            minGestation: Number(form.minGestation),
            maxGestation: Number(form.maxGestation),
        });
    }, [form, scriptId, item, onChange]);

    const onClose = useCallback(() => {
        setOpen(false);
        setForm(getDefaultForm())

        router.push(`?${queryString.stringify({ 
            ...searchParamsObj, 
            itemId: undefined, 
            addDrug: undefined, 
        })}`);

        const scrollPos = containerDiv?.top || 0;
        setTimeout(() => window.scrollTo({ top: scrollPos, }), 500);
    }, [searchParamsObj, containerDiv, router.push]);

    const loadScreens = useCallback(async () => {
        if (!screensInitialised.current && open) {
            try {
                setLoading(true);

                const res = await axios.get<Awaited<ReturnType<typeof getScriptsMetadata>>>('/api/scripts/metadata?data='+JSON.stringify({ scriptsIds: [scriptId], }));
                const { data, errors } = res.data;

                if (errors?.length) throw new Error(errors.join(', '));

                screensInitialised.current = true;

                const keys = data.reduce((acc, item) => {
                    item.screens.forEach(s => s.fields.forEach(f => {
                        if (f.key) {
                            acc[f.key.toLowerCase()] = f.key;
                        }
                    }));
                    return acc;
                }, {} as { [key: string]: string; })

                setKeys(Object.values(keys));
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
    }, [scriptId, open, alert]);

    useEffect(() => { loadScreens(); }, [open, loadScreens]);

    const isFormComplete = useCallback(() => {
        return !!(
            form.drug && 
            form.minWeight && 
            form.minGestation &&
            form.maxWeight && 
            form.maxGestation &&
            form.managementText &&
            form.dosageText &&
            Number(form.minGestation || '0') <= Number(form.maxGestation || '0') &&
            Number(form.minWeight || '0') <= Number(form.maxWeight || '0')
        );
    }, [form]);

    const isSaveButtonDisabled = useCallback(() => {
        return !isFormComplete() ||
            loading ||
            disabled;
    }, [isFormComplete, loading, disabled]);

    return (
        <>
            {loading && <Loader overlay />}

            <div ref={containerDivRef}>
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
                            <SheetTitle>{addDrug ? 'Add' : ''}{itemId ? 'Edit' : ''} drug</SheetTitle>
                            <SheetDescription className="hidden"></SheetDescription>
                        </SheetHeader>

                        <div ref={contentDivRef} className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                            <div className="px-4">
                                <Label secondary htmlFor="drug">Drug *</Label>
                                <Input
                                    name="drug"
                                    className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                    value={form.drug}
                                    onChange={e => setForm(prev => ({ ...prev, drug: e.target.value, }))}
                                />
                            </div>

                            <div className="px-4 flex gap-x-2">
                                <div className="flex-1">
                                    <Label secondary htmlFor="minGestation">Min Gestation (weeks) *</Label>
                                    <Input
                                        name="minGestation"
                                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                        value={form.minGestation}
                                        type="number"
                                        onChange={e => {
                                            const minGestation = e.target.value;
                                            let maxGestation = form.maxGestation;

                                            if (!minGestation) maxGestation = '';

                                            setForm(prev => ({ 
                                                ...prev, 
                                                minGestation, 
                                                maxGestation,
                                            }));
                                        }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <Label 
                                        secondary 
                                        htmlFor="maxGestation"
                                        error={Number(form.minGestation || '0') > Number(form.maxGestation || '0')}
                                    >Max Gestation (weeks) *</Label>
                                    <Input
                                        name="maxGestation"
                                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                        value={form.maxGestation}
                                        type="number"
                                        disabled={!form.minGestation}
                                        min={form.minGestation}
                                        error={Number(form.minGestation || '0') > Number(form.maxGestation || '0')}
                                        onChange={e => setForm(prev => ({ ...prev, maxGestation: e.target.value, }))}
                                    />
                                </div>
                            </div>

                            <div className="px-4">
                                <Label secondary htmlFor="gestationKey">Gestation Key *</Label>
                                <Select
                                    value={form.gestationKey || ''}
                                    required
                                    name="gestationKey"
                                    disabled={disabled}
                                    onValueChange={value => {
                                        setForm(prev => ({ ...prev, gestationKey: value || '', }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gestation key" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {keys.map(key => (
                                                <SelectItem key={key} value={key}>
                                                    {key}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="px-4 flex gap-x-2">
                                <div className="flex-1">
                                    <Label secondary htmlFor="minWeight">Min Weight (weeks) *</Label>
                                    <Input
                                        name="minWeight"
                                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                        value={form.minWeight}
                                        type="number"
                                        onChange={e => {
                                            const minWeight = e.target.value;
                                            let maxWeight = form.maxWeight;

                                            if (!minWeight) maxWeight = '';

                                            setForm(prev => ({ 
                                                ...prev, 
                                                minWeight, 
                                                maxWeight,
                                            }));
                                        }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <Label 
                                        secondary 
                                        htmlFor="maxWeight"
                                        error={Number(form.minWeight || '0') > Number(form.maxWeight || '0')}
                                    >Max Weight (weeks) *</Label>
                                    <Input
                                        name="maxWeight"
                                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                        value={form.maxWeight}
                                        type="number"
                                        disabled={!form.minWeight}
                                        min={form.minWeight}
                                        error={Number(form.minWeight || '0') > Number(form.maxWeight || '0')}
                                        onChange={e => setForm(prev => ({ ...prev, maxWeight: e.target.value, }))}
                                    />
                                </div>
                            </div>

                            <div className="px-4">
                                <Label secondary htmlFor="gestationKey">Weight Key *</Label>
                                <Select
                                    value={form.weightKey || ''}
                                    required
                                    name="weightKey"
                                    disabled={disabled}
                                    onValueChange={value => {
                                        setForm(prev => ({ ...prev, weightKey: value || '', }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gestation key" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {keys.map(key => (
                                                <SelectItem key={key} value={key}>
                                                    {key}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="px-4">
                                <Label secondary htmlFor="managementText">Management text *</Label>
                                <Input
                                    name="managementText"
                                    className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                    value={form.managementText}
                                    onChange={e => setForm(prev => ({ ...prev, managementText: e.target.value, }))}
                                />
                            </div>

                            <div className="px-4">
                                <Label secondary htmlFor="weight">Dosage text *</Label>
                                <Input
                                    name="dosageText"
                                    className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                    value={form.dosageText}
                                    onChange={e => setForm(prev => ({ ...prev, dosageText: e.target.value, }))}
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
                                    disabled={isSaveButtonDisabled()}
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
