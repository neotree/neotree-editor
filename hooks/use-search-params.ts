import { useSearchParams as _useSearchParams, useRouter } from "next/navigation";
import queryString from 'query-string';
import { useCallback, useMemo } from "react";

export function useSearchParams() {
    const router = useRouter();
    const searchParams = _useSearchParams();

    const stringified = useMemo(() => searchParams.toString(), [searchParams]);
    const parsed = useMemo(() => {
        return queryString.parse(searchParams.toString()) as { [key: string]: string; };
    }, [searchParams]);

    const toSearchParams = useCallback((params: { [key: string]: any; }) => {
        return queryString.stringify({ ...parsed, ...params, });
    }, [parsed]);

    const push = useCallback((params: { [key: string]: any; }) => {
        router.push(`?${toSearchParams(params)}`);
    }, [toSearchParams, router]);

    const replace = useCallback((params: { [key: string]: any; }) => {
        router.replace(`?${toSearchParams(params)}`);
    }, [toSearchParams, router]);

    return { 
        parsed,
        stringified,
        replace,
        push,
        toSearchParams,
    };
}
