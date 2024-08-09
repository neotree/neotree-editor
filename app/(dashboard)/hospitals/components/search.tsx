'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMeasure } from 'react-use';

import { searchHospitals } from "@/app/actions/_hospitals";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination } from "@/components/pagination";
import { DataTable } from "@/components/data-table";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "@/hooks/use-search-params";
import { HospitalAction } from "./action";

type Props = {
    searchHospitals: typeof searchHospitals;
    onDelete: (ids: string[], cb?: () => void) => void;
};

export function Search({ searchHospitals, onDelete, }: Props) {
    const timeout = useRef<any>();

    const [formRef, { width: formWidth, }] = useMeasure<HTMLFormElement>();
    const searchParams = useSearchParams();

    const [openPopover, setOpenPopover] = useState(false);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<Awaited<ReturnType<typeof searchHospitals>>>();
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>();

    const { watch, register, handleSubmit, } = useForm({
        defaultValues: {
            searchValue: '',
        },
    });

    const searchValue = watch('searchValue');
    const page = useMemo(() => searchResults?.page || 1, [searchResults?.page]);
    const hrefHospitalId = useMemo(() => searchParams.parsed.hospitalId, [searchParams.parsed.hospitalId]);

    useEffect(() => { if (!searchValue) setOpenPopover(false); }, [searchValue]);

    const onSearch = useCallback(async (params: Partial<Parameters<typeof searchHospitals>[0]>) => {
        try {
            if (searchValue || (searchResults?.searchValue !== searchValue)) {
                setLoading(true);
                const res = await searchHospitals({ searchValue, limit: 5, ...params });
                if (res.error) {
                    toast.error(res.error);
                } else {
                    setSearchResults(res);
                }
            }
        } catch(e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [searchValue, searchResults, searchHospitals]);

    useEffect(() => {
        if (hrefHospitalId && searchResults && (selectedHospitalId !== hrefHospitalId)) {
            const selectedHospitalId = searchResults.data.filter(u => u.hospitalId === hrefHospitalId)[0]?.hospitalId;
            setSelectedHospitalId(selectedHospitalId);
        }
    }, [hrefHospitalId, searchResults, selectedHospitalId]);

    useEffect(() => {
        if (selectedHospitalId && !hrefHospitalId) {
            setSelectedHospitalId(undefined);
            onSearch({ page, });
        }
    }, [hrefHospitalId, selectedHospitalId, page, onSearch]);

    const onSubmit = handleSubmit(({ searchValue }) => {
        (async () => {
            try {
                if (searchValue) {
                    if (timeout.current) clearTimeout(timeout.current);

                    setSearching(true);
                    setOpenPopover(true);

                    const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
                    setTimeout(() => searchInput?.focus(), 10);

                    await onSearch({ searchValue });
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
                        type="search"
                        placeholder="Search hospitals"
                        data-search-input="true"
                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                        onFocus={e => {
                            setOpenPopover(!!searchValue);
                            setTimeout(() => e.target.focus(), 0);
                        }}
                        onKeyUp={() => {
                            if (timeout.current) clearTimeout(timeout.current);
                            timeout.current = setTimeout(onSubmit, 1000);
                        }}
                    />
                </form>
            </PopoverTrigger>

            <PopoverContent 
                style={{ width: formWidth }}
                className="flex flex-col gap-y-2 p-0"
            >
                {!!searchResults && (
                    <>
                        <DataTable
                            loading={loading}
                            maxRows={5}
                            columns={[
                                {
                                    name: 'Name',
                                },
                                {
                                    name: 'Action',
                                    align: 'right',
                                    // thClassName: 'opacity-0',
                                    cellRenderer(cell) {
                                        const u = searchResults.data[cell.rowIndex];
                                        return (
                                            <HospitalAction 
                                                hospitalId={u.hospitalId}
                                                hospitalName={u.name}
                                                onDelete={() => onDelete(
                                                    [u.hospitalId], 
                                                    () => onSearch({ page: searchResults.page, }),
                                                )}
                                            />
                                        );
                                    },
                                },
                            ]}
                            data={searchResults.data.map(u => [
                                u.name || '',
                                ''
                            ])}
                        />

                        <Separator />

                        <div className="p-2">
                            <Pagination
                                currentPage={searchResults.page}
                                totalPages={searchResults.totalPages}
                                disabled={loading}
                                limit={searchResults.limit || searchResults.totalRows}
                                totalRows={searchResults.totalRows}
                                collectionName="hospitals"
                                onPaginate={page => onSearch({ page, })}
                                hideControls={false}
                                hideSummary={false}
                            />
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}