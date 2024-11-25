'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export type PopoverSelectProps = {
    selectMultiple?: boolean;
    placeholder?: React.ReactNode;
    value: (string | number)[];
    defaultValues?: (string | number)[];
    options: {
        value: string | number;
        label: React.ReactNode;
    }[];
    onChange?: (selected: (string | number)[]) => void;
};

const allOption = {
    label: 'All',
    value: '__all__',
};

export function PopoverSelect({
    placeholder,
    value: valueProp,
    options: optionsProp,
    selectMultiple = true,
    defaultValues,
    onChange,
}: PopoverSelectProps) {
    const value = useMemo(() => {
        if (!valueProp.length) valueProp = defaultValues || [];
        valueProp = valueProp.filter(v => v);
        if (!selectMultiple) return valueProp.filter((_, i) => i === valueProp.length - 1);
        return valueProp;
    }, [valueProp, selectMultiple, defaultValues]);

    const options = useMemo(() => {
        const options = [
            ...(!selectMultiple ? [] : [allOption]),
            ...optionsProp,
        ].map(o => {
            const optVal = `${o.value}`;
            return {
                ...o,
                id: [Math.random().toString(36),Math.random().toString(36)].join(''),
                value: optVal,
                originalValue: o.value,
                selected: value.map(v => `${v}`).includes(optVal),
            };
        });

        if (selectMultiple) options 

        return options;
    }, [optionsProp, value, selectMultiple]);

    const [selected, setSelected] = useState<{ [key: string]: undefined | typeof options[0]; }>({});

    useEffect(() => {
        setSelected(options.reduce((acc, o) => ({
            ...acc,
            [o.value]: o.selected ? o : undefined,
        }), {} as { [key: string]: undefined | typeof options[0]; }))
    }, [options]);

    const selectedValue = useMemo(() => {
        const opts = Object.values(selected).filter(o => o).map(o => o!);
        if (opts.length > 1) return `${opts.length + 1} selected`;
        return opts[0]?.label || placeholder || null;
    }, [selected, placeholder]);

    return (
        <>
            <Popover>
                <PopoverTrigger className="w-[180px]" asChild>
                    <Button
                        variant="outline"
                        className="w-full"
                    >
                        <div className="flex-1">
                            {selectedValue}
                        </div>
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 max-h-[400px] overflow-y-auto">
                    {options.map(o => {
                        let checked = !!selected[o.value];
                        if (o.value === allOption.value) checked = Object.values(selected).length === options.length;

                        return (
                            <Label 
                                key={o.id}
                                htmlFor={o.id}
                                className="flex items-center gap-x-2 p-2 hover:bg-primary/10"
                            >
                                <Checkbox 
                                    id={o.id}
                                    checked={checked}
                                    onCheckedChange={() => {
                                        let _selected = { ...selected, [o.value]: checked ? undefined : o, };
                                        if (!selectMultiple) _selected = { [o.value]: checked ? undefined : o, };

                                        if (o.value === allOption.value) {
                                            _selected = checked ? {} : options.reduce((acc, o) => {
                                                if (o.value === allOption.value) return acc;
                                                return {
                                                    ...acc,
                                                    [o.value]: o,
                                                };
                                            }, {} as typeof selected);
                                        }

                                        setSelected(_selected);

                                        onChange?.(
                                            Object.keys(_selected)
                                                .filter(key => _selected[key])
                                                .map(key => _selected[key]!.originalValue)
                                                .filter(v => v)
                                                .filter(key => key !== allOption.value)
                                        );
                                    }}
                                />
                                <div>{o.label}</div>
                            </Label>
                        )
                    })}
                </PopoverContent>
            </Popover>
        </>
    );
}
