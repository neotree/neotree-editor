'use client';

import { Fragment, useEffect, useMemo, useState } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";

export type SelectModalOption = {
    value: string | number;
    label: string | number;
    description?: string;
    caption?: string;
    disabled?: boolean;
    data?: Record<string, any>;
};

type Props = {
    modal?: boolean;
    placeholder?: string;
    selected?: string | number | (string | number)[];
    options: SelectModalOption[];
    multiple?: boolean;
    error?: boolean;
    disabled?: boolean;
    search?: {
        placeholder?: string;
    };
    header?: React.ReactNode;
    loading?: boolean;
    trigger?: React.ReactNode;
    onSelect: (selected: SelectModalOption[]) => void;
    onTrigger?: () => void;
};

export function SelectModal({ 
    options: optionsProp, 
    selected: selectedProp, 
    ...props 
}: Props) {
    selectedProp = Array.isArray(selectedProp) ? selectedProp : !selectedProp ? [] : [selectedProp];

    const options = optionsProp.map(o => ({ ...o, value: `${o.value}`, }));
    const selected = selectedProp.map(o => `${o}`);

    let selectedValueExists = true;

    if (!props.multiple) {
        const [value] = Array.isArray(selected) ? selected : [selected];
        if (value) selectedValueExists = !!options.find(o => o.value === value);
    }

    return (
        <Modal 
            {...props}
            options={options}
            selected={selected}
        />
    );
}

function Modal({ 
    modal,
    header,
    placeholder,
    search,
    multiple = false,
    error = false,
    disabled = false,
    selected: selectedProp,
    options: optionsProp = [],
    trigger,
    onTrigger,
    onSelect,
}: Omit<Props, 'selected' | 'options'> & {
    selected: string[];
    options: (Omit<SelectModalOption, 'value'> & {
        value: string;
    })[];
}) {
    const [searchValue, setSearchValue] = useState('');
    const searchValueDebounced = useDebounce(searchValue);

    const [selectedPending, setSelectedPending] = useState<SelectModalOption['value'][]>([]);

    const selected = useMemo(() => {
        if (!selectedProp) {
            return [] as typeof optionsProp;
        } else if (Array.isArray(selectedProp)) {
            return selectedProp.map(v => optionsProp.find(o => o?.value === v)!).map(o => o);
        } else {
            return optionsProp.filter(o => o?.value === selectedProp) || [];
        }

    }, [selectedProp, optionsProp]);

    const options = useMemo(() => {
        const filtered = optionsProp
            .map(o => {
                const selectedValues = selected.map(o => o?.value).map(s => `${s || ''}`).filter(s => s);
                let isSelected = selectedValues.includes(`${o?.value}`);
                if (multiple) isSelected = selectedPending.includes(o.value);

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
            .filter(o => {
                const search = searchValueDebounced.toLowerCase();
                if (!search) return true;

                const haystack = JSON.stringify([
                    o.value || '', 
                    o.label || '', 
                    // o.caption || '', 
                    o.description || '',
                ]).toLowerCase();

                return haystack.includes(search);
            });

        return filtered;
    }, [optionsProp, searchValueDebounced, selected, selectedPending]);

    useEffect(() => () => setSearchValue(''), []);

    useEffect(() => {
        if (!multiple) return;
        setSelectedPending(selected.map(o => o.value));
    }, [multiple, selected]);

    const hasPendingChanges = useMemo(() => {
        if (!multiple) return false;
        const selectedValues = selected.map(o => `${o.value}`).sort();
        const pendingValues = selectedPending.map(o => `${o}`).sort();
        if (selectedValues.length !== pendingValues.length) return true;
        return selectedValues.some((value, index) => value !== pendingValues[index]);
    }, [multiple, selected, selectedPending]);

    return (
        <>
            <Dialog
                modal={modal}
                onOpenChange={() => {
                    setSearchValue('');
                    if (multiple) {
                        setSelectedPending(selected.map(o => o.value));
                    } else {
                        setSelectedPending([]);
                    }
                }}
            >
                <DialogTrigger asChild>
                    {trigger || (
                        <Button
                            disabled={disabled}
                            variant="outline"
                            className={cn(
                                'justify-between w-full',
                                error && 'border border-destructive hover:bg-destructive/10',
                            )}
                            onClick={onTrigger}
                        >
                            <span className={!selected.length ? 'opacity-50' : ''}>{selected[0]?.label  || placeholder || ''}</span>
                            <ChevronsUpDown className="size-4 opacity-50" />
                        </Button>
                    )}
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
                                                if (multiple) {
                                                    setSelectedPending(prev => prev.filter(v => v !== o.value));
                                                } else {
                                                    onSelect?.(selected.filter(s => s.value !== o.value));
                                                }
                                            } else {
                                                if (multiple) {
                                                    setSelectedPending(prev => [...prev, o.value]);
                                                } else {
                                                    onSelect?.([o]);
                                                }
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
                        className="border-t border-t-border px-4 py-2 items-center w-full gap-x-2"
                    >
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Close
                            </Button>
                        </DialogClose>

                        {hasPendingChanges && (
                            <DialogClose asChild>
                                <Button
                                    onClick={() => {
                                        onSelect?.(
                                            selectedPending.map(v => options.find(o => o.value === v)!)
                                                .filter(o => o)
                                        );
                                    }}
                                >
                                    Save
                                </Button>
                            </DialogClose>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
