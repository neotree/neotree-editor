'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMeasure } from 'react-use';

import { Input } from "@/components/ui/input";
import { DataTableSearchOptions } from "./types";

type Props = DataTableSearchOptions;

export function DataTableSearch({
    inputPlaceholder,
    onSearch,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [formWidth, setFormWidth] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    const { register, watch, setValue } = useForm({
        defaultValues: {
            searchValue: '',
        },
    });

    const searchValue = watch('searchValue');

    // Proper input ref handling
    const { ref: formRefCallback, ...rest } = register('searchValue');

    // Combine refs correctly
    const setRefs = useCallback((element: HTMLInputElement | null) => {
        formRefCallback(element);
        if (element) {
            // @ts-ignore - We know this is safe
            inputRef.current = element;
        }
    }, [formRefCallback]);

    // Measure form width
    useEffect(() => {
        if (formRef.current) {
            const resizeObserver = new ResizeObserver(entries => {
                setFormWidth(entries[0].contentRect.width);
            });
            resizeObserver.observe(formRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch?.(searchValue);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSearching(true);
        setValue('searchValue', e.target.value, { shouldDirty: true });
        
        // Maintain focus and cursor position
        if (inputRef.current) {
            const cursorPosition = e.target.selectionStart;
            requestAnimationFrame(() => {
                if (inputRef.current && cursorPosition !== null) {
                    inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
                }
            });
        }
    };

    return (
        <div className="w-full">
            <form ref={formRef}>
                <Input
                    {...rest}
                    ref={setRefs}
                    type="search"
                    placeholder={inputPlaceholder || 'Search...[title,description,hospital]'}
                    value={searchValue}
                    onChange={handleChange}
                    className="w-full"
                />
            </form>
        </div>
    );
}