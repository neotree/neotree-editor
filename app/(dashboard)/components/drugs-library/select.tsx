'use client';

import { useEffect, useState } from "react";
import { Pencil, PlusIcon } from "lucide-react";
import Link from "next/link";

import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { Loader } from "@/components/loader";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DrugsLibraryForm } from './form';

type Props = {
    disabled?: boolean;
    selected?: string[];
    unselectable?: string[];
    onChange: (selected: string[]) => void;
};

export function SelectDrug({ 
    disabled, 
    selected: selectedProp, 
    unselectable = [],
    onChange 
}: Props) {
    const { 
        loading, 
        drugs, 
        selectedItemId: itemId, 
        addLink, 
        editLink,
        saveDrugs 
    } = useDrugsLibrary();

    const [selected, setSelected] = useState<string[]>(selectedProp || []);

    useEffect(() => { setSelected(selectedProp || []); }, [selectedProp]);

    return (
        <>
            {loading && <Loader overlay />}

            <DrugsLibraryForm
                disabled={disabled}
                item={drugs.filter(s => s.itemId === itemId)[0]}
                onChange={saveDrugs}
            />

            <div className="flex flex-col gap-y-4">
                <div>
                    <Label htmlFor="drug">Select drug *</Label>
                    <Select
                        value={selected[0] || ''}
                        disabled={disabled}
                        name="drug"
                        onValueChange={v => {
                            const value = v ? [v] : [];
                            setSelected(value);
                            onChange(value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select drug from library" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Drugs</SelectLabel>
                            {drugs.map(item => (
                                <SelectItem 
                                    key={item.key} 
                                    value={item.key!}
                                    disabled={unselectable.includes(item.key!)}
                                >
                                    {item.drug}
                                </SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-x-4 text-xs">
                    {!!selected[0] && (
                        <Link 
                            href={editLink(selected[0])}
                            className="flex items-center text-primary justify-center gap-x-1 opacity-70 hover:opacity-100"
                        >
                            <Pencil className="size-4" />
                            <span>Edit selected drug</span>
                        </Link>
                    )}
                    <Link 
                        href={addLink}
                        className="flex items-center justify-center gap-x-1 opacity-70 hover:opacity-100"
                    >
                        <PlusIcon className="size-4" />
                        <span>Add drug to library</span>
                    </Link>
                </div>

                {!!selected[0] && (
                    <div className="opacity-80">
                        <DrugsLibraryForm 
                            disabled={true}
                            floating={false}
                            item={drugs.filter(item => item.key === selected[0])[0]}
                            onChange={saveDrugs}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
