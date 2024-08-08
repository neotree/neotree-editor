'use client';

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMeasure } from 'react-use';

import { searchScripts } from "@/app/actions/_scripts";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchParams } from "@/hooks/use-search-params";
import { DataTableSearchOptions } from "./types";

type Props = DataTableSearchOptions;

export function DataTableSearch({
    inputPlaceholder,
}: Props) {
    const timeout = useRef<any>();

    const [formRef, { width: formWidth, }] = useMeasure<HTMLFormElement>();
    const searchParams = useSearchParams();

    const [openPopover, setOpenPopover] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Awaited<ReturnType<typeof searchScripts>>>();

    const { watch, register, handleSubmit, } = useForm({
        defaultValues: {
            searchValue: '',
        },
    });

    const searchValue = watch('searchValue');

    useEffect(() => { if (!searchValue) setOpenPopover(false); }, [searchValue]);

    const onSubmit = handleSubmit(({ searchValue }) => {
        (async () => {
            try {
                if (searchValue) {
                    
                } else {
                    setSearchResults(undefined);
                    setOpenPopover(false);
                }
            } catch(e: any) {
                toast.error(e.message);
            } finally {
                setSearching(false);
            }
        })();
    });

    return (
        <Popover
            open={openPopover}
            onOpenChange={open => {
                setOpenPopover(open);
            }}
        >
            <PopoverTrigger disabled className="w-full">
                <form 
                    onSubmit={onSubmit}
                    className=""
                    ref={formRef}
                >
                    <Input
                        {...register('searchValue', { required: true, })}
                        noRing
                        type="search"
                        placeholder={inputPlaceholder || 'Search'}
                        data-search-input="true"
                        // onFocus={e => {
                        //     setOpenPopover(!!searchValue);
                        //     setTimeout(() => e.target.focus(), 0);
                        // }}
                        // onKeyUp={() => {
                        //     if (timeout.current) clearTimeout(timeout.current);
                        //     timeout.current = setTimeout(onSubmit, 1000);
                        // }}
                    />
                </form>
            </PopoverTrigger>

            <PopoverContent 
                style={{ width: formWidth }}
                className="flex flex-col gap-y-2 p-0"
            >
                
            </PopoverContent>
        </Popover>
    );
}
