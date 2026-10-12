import * as nextNavigation from "next/navigation";
import { useMemo } from "react";

export function useNavigation() {
    const router = nextNavigation.useRouter();
    const params = nextNavigation.useParams();
    const navSearchParams = nextNavigation.useSearchParams();

    const searchParams = useMemo(() => {
        const searchParams: Record<string, null | string> = {};
        for (const key of navSearchParams.keys()) searchParams[key] = navSearchParams.get(key);
        return searchParams;
    }, [navSearchParams]);

    return {
        router,
        params,
        searchParams,
    };
}
