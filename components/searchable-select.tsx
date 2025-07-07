"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
    value: string | number;
    label: string | number;
};

type Props = {
    options: Option[];
};

export function SearchableSelect({ options }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    return (
        <div>
            <Popover 
                modal
                open={open} 
                onOpenChange={setOpen}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between w-full"
                    >
                        {value ? options.find((o) => o.value === value)?.label : "Select key..."}
                        <ChevronsUpDown className="w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search key..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>No keys found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((o) => (
                                    <CommandItem
                                        key={o.value}
                                        value={`${o.value}`}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        {o.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === o.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
