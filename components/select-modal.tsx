'use client';

import { Fragment, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Dialog, 
    DialogClose, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger, 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Option = {
    value: string | number;
    label: string | number;
    description?: string;
    caption?: string;
    disabled?: boolean;
};

type Props = {
    placeholder?: string;
    selected?: string | number | (string | number)[];
    options: Option[];
    multiple?: boolean;
    error?: boolean;
    disabled?: boolean;
    search?: {
        placeholder?: string;
    };
    header?: React.ReactNode;
    onSelect: (selected: Option[]) => void;
};

export function SelectModal({ 
    header,
    placeholder,
    search,
    multiple = false,
    error = false,
    disabled = false,
    selected: selectedProp,
    options: optionsProp = [],
    onSelect,
}: Props) {
    const [searchValue, setSearchValue] = useState('');
    const deferredSearchValue = useDeferredValue(searchValue);

    const selected = useMemo(() => {
        if (!selectedProp) {
            return [] as typeof optionsProp;
        } else if (Array.isArray(selectedProp)) {
            return selectedProp.map(v => optionsProp.find(o => o.value === v)!).map(o => o);
        } else {
            return optionsProp.filter(o => o.value === selectedProp) || [];
        }

    }, [selectedProp, optionsProp]);

    const options = useMemo(() => {
        return optionsProp
            .map(o => {
                const isSelected = selected.map(o => o.value).map(s => `${s || ''}`).filter(s => s).includes(`${o.value}`);
                return {
                    ...o,
                    isSelected,
                };
            })
            .sort((a, b) => {
                const v1 = a.disabled ? 1 : 0;
                const v2 = b.disabled ? 1 : 0;
                return v1 - v2;
            })
            .sort((a, b) => {
                const v1 = a.isSelected ? 1 : 0;
                const v2 = b.isSelected ? 1 : 0;
                return v2 - v1;
            })
            .filter(o => `${o.value || ''}`.includes(deferredSearchValue));
    }, [optionsProp, deferredSearchValue, selected]);

    useEffect(() => () => setSearchValue(''), []);

    return (
        <>
            <Dialog
                onOpenChange={() => {
                    setSearchValue('');
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        disabled={disabled}
                        variant="outline"
                        className={cn(
                            'justify-between w-full',
                            error && 'border border-destructive hover:bg-destructive/10',
                        )}
                    >
                        <span className={!selected.length ? 'opacity-50' : ''}>{selected[0]?.label  || placeholder || ''}</span>
                        <ChevronsUpDown className="size-4 opacity-50" />
                    </Button>
                </DialogTrigger>

                <DialogContent
                    hideCloseButton
                    className="flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl"
                >
                    <DialogHeader
                        className="border-b border-b-border px-4 py-4"
                    >
                        <DialogTitle className="hidden">{""}</DialogTitle>
                        <DialogDescription className="hidden">{""}</DialogDescription>
                        <div className="flex items-center gap-x-4">
                            {!search ? null : (
                                <div className="flex-1">
                                    <Input 
                                        type="search"
                                        placeholder={search.placeholder || ''}
                                        value={searchValue}
                                        onChange={e => setSearchValue(e.target.value)}
                                    />
                                </div>
                            )}
                            {header}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col gap-y-1 overflow-y-auto px-4 py-2 overflow-x-hidden">
                        {options.map(o => {
                            const Btn = multiple ? 'button' : DialogClose;
                            return (
                                <Fragment key={o.value}>
                                    <Btn 
                                        onClick={() => {
                                            if (o.disabled) return;
                                            if (o.isSelected) {
                                                onSelect?.(selected.filter(s => s.value !== o.value));
                                            } else {
                                                onSelect?.(multiple ? [...selected, o] : [o]);
                                            }
                                        }}
                                        className={cn(
                                            'flex flex-col gap-y-1 border border-border p-2 rounded-md items-start text-left',
                                            o.disabled ? 'opacity-50 cursor-not-allowed' : 'transition-colors hover:bg-primary/20',
                                            o.isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                        )}
                                    >
                                        <div className="flex items-center">
                                            {!o.isSelected ? null : <Check className="size-4 mr-2" />}
                                            <div>
                                                {!o.caption ?  null : <div className="text-xs opacity-60" dangerouslySetInnerHTML={{ __html: o.caption || '', }} />}
                                                <p>{o.label}</p>
                                                {!o.description ?  null : <div className="text-xs opacity-60" dangerouslySetInnerHTML={{ __html: o.description || '', }} />}
                                            </div>
                                        </div>
                                        
                                    </Btn>
                                </Fragment>
                            );
                        })}
                    </div>

                    <DialogFooter
                        className="border-t border-t-border px-4 py-2 items-center w-full"
                    >
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
