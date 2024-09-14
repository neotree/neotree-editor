'use client';

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Preferences } from "@/types";
import { defaultPreferences } from "@/constants";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    id: string;
    hide?: boolean;
    label?: string;
    disabled?: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;
    data: Preferences;
    onSave: (data: Preferences) => void;
};

export function PreferencesForm({ 
    id,
    label,
    hide,
    title, 
    description,
    data, 
    disabled,
    onSave, 
}: Props) {
    const isUpdating = useMemo(() => {
        let isUpdating = false;
        Object.values(data).forEach(pref => {
            if (pref[id]) isUpdating = true;
        });
        return isUpdating;
    }, [data, id]);

    const {
        reset,
        watch,
        setValue,
        handleSubmit,
    } = useForm({
        defaultValues: { ...defaultPreferences, ...data, },
    });

    const fontSize = watch('fontSize');
    const fontWeight = watch('fontWeight');
    const fontStyle = watch('fontStyle');
    const textColor = watch('textColor');
    // const backgroundColor = watch('backgroundColor');
    // const highlight = watch('highlight');

    const onSubmit = handleSubmit(onSave);

    const [isOpen, setIsOpen] = useState(false);

    if (hide) return null;

    return (
        <>
            <Sheet
                onOpenChange={open => {
                    reset({ ...defaultPreferences, ...data, });
                    setIsOpen(open);
                }}
            >
                <SheetTrigger asChild>
                    <Button
                        variant="link"
                        className={cn('p-0 text-xs', !isUpdating && 'text-muted-foreground/80 hover:text-muted-foreground')}
                    >
                        {label || `${isUpdating ? 'Update' : 'Set'} preferences`}
                    </Button>
                </SheetTrigger>

                <SheetContent
                    hideCloseButton
                    className="px-0 py-0 flex flex-col gap-y-4 h-full"
                >
                    <SheetHeader className="px-4 py-4 border-b border-b-border">
                        <SheetTitle>{title}</SheetTitle>
                        <SheetDescription className={!description ? 'hidden' : ''}>{description}</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-y-6">
                        {isOpen && (
                            <>
                                <div className="flex gap-x-2 items-center">
                                    <Label secondary htmlFor={`fontSize.${id}`}>Font size</Label>
                                    <div>
                                        <Select
                                            value={fontSize[id] || 'default'}
                                            required
                                            name={`fontSize.${id}`}
                                            disabled={disabled}
                                            onValueChange={v => {
                                                let value = (v || undefined) as typeof fontSize[typeof id];
                                                if (value === 'default') value = undefined;
                                                setValue(`fontSize.${id}`, value, { shouldDirty: true, });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Default" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {[
                                                        { label: 'Default', value: 'default', },
                                                        { label: 'Extra small', value: 'xs', },
                                                        { label: 'Small', value: 'sm', },
                                                        { label: 'Large', value: 'lg', },
                                                        { label: 'Extra large', value: 'xl', },
                                                    ].map(h => (
                                                        <SelectItem key={h.value} value={h.value}>
                                                            {h.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
        
                                <div>
                                    <div className="flex flex-col gap-2">
                                        {!!textColor[id] && (
                                            <div className="flex gap-x-2 items-center">
                                                <Label secondary htmlFor={`textColor.${id}`}>Text color</Label>
                                                <input 
                                                    type="color"
                                                    value={textColor[id]}
                                                    onChange={e => setValue(`textColor.${id}`, e.target.value, { shouldDirty: true, })}
                                                />
                                            </div>
                                        )}
        
                                        <div className="flex gap-x-2">
                                            <Checkbox 
                                                id={`defaultTextColor.${id}`}
                                                name={`defaultTextColor.${id}`}
                                                disabled={disabled}
                                                checked={!textColor[id]}
                                                onCheckedChange={() => {
                                                    const value = textColor[id] ? undefined : '#000000';
                                                    setValue(`textColor.${id}`, value, { shouldDirty: true, });
                                                }}
                                            />
                                            <Label secondary htmlFor={`defaultTextColor.${id}`}>Default text color</Label>
                                        </div>
                                    </div>
                                </div>
        
                                {/* <div>
                                    <div className="flex flex-col gap-2">
                                        {!!backgroundColor[id] && (
                                            <div className="flex gap-x-2 items-center">
                                                <Label secondary htmlFor={`backgroundColor.${id}`}>Background color</Label>
                                                <input 
                                                    type="color"
                                                    value={backgroundColor[id]}
                                                    onChange={e => setValue(`backgroundColor.${id}`, e.target.value, { shouldDirty: true, })}
                                                />
                                            </div>
                                        )}
        
                                        <div className="flex gap-x-2">
                                            <Checkbox 
                                                id={`defaultBgColor.${id}`}
                                                name={`defaultBgColor.${id}`}
                                                disabled={disabled}
                                                checked={!backgroundColor[id]}
                                                onCheckedChange={() => {
                                                    const value = backgroundColor[id] ? undefined : '#000000';
                                                    setValue(`backgroundColor.${id}`, value, { shouldDirty: true, });
                                                }}
                                            />
                                            <Label secondary htmlFor={`defaultBgColor.${id}`}>Default background color</Label>
                                        </div>
                                    </div>
                                </div> */}
        
                                <div className="flex gap-4 flex-wrap">
                                    <div className="flex gap-x-2">
                                        <Checkbox 
                                            name="bold"
                                            id="bold"
                                            disabled={disabled}
                                            checked={fontWeight[id] === 'bold'}
                                            onCheckedChange={() => setValue(`fontWeight.${id}`, fontWeight[id] ? undefined! : "bold", { shouldDirty: true, })}
                                        />
                                        <Label secondary htmlFor="bold">Bold</Label>
                                    </div>
        
                                    <div className="flex gap-x-2">
                                        <Checkbox 
                                            name="italic"
                                            id="italic"
                                            disabled={disabled}
                                            checked={(fontStyle[id] || []).includes('italic')}
                                            onCheckedChange={() => {
                                                let value = fontStyle[id] || [];
                                                if (value.includes('italic')) {
                                                    value = value.filter(s => s !== 'italic');
                                                } else {
                                                    value.push('italic');
                                                }
                                                if (!value.length) value = undefined!;
                                                setValue(`fontStyle.${id}`, value, { shouldDirty: true, })
                                            }}
                                        />
                                        <Label secondary htmlFor="italic">Italic</Label>
                                    </div>
        
                                    {/* <div className="flex gap-x-2">
                                        <Checkbox 
                                            name="highlight"
                                            id="highlight"
                                            disabled={disabled}
                                            checked={highlight[id]}
                                            onCheckedChange={() => setValue(`fontStyle.${id}`, highlight[id] ? undefined! : true, { shouldDirty: true, })}
                                        />
                                        <Label secondary htmlFor="highlight">Highlight</Label>
                                    </div> */}
                                </div>
                            </>
                        )}
                    </div>

                    <SheetFooter className="px-4 py-4 border-t border-t-border">
                        <div className="ml-auto" />

                        <SheetClose asChild>
                            <Button variant="outline">
                                Cancel
                            </Button>
                        </SheetClose>

                        <SheetClose asChild>
                            <Button 
                                disabled={disabled}
                                onClick={() => onSubmit()}
                            >
                                Save
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
