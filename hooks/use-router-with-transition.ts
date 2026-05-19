import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";

type ParamValue = undefined | number | boolean | string | string[];

/**
 * This will:
 * * wrap the router methods inside a transition, i.e. `push`, `replace`, `refresh`, `back`, `forward`, `prefetch`
 * * return the router and the transition status: `isRouterTransitionPending`
 * */
export function useRouterWithTransition()
{
	const [isPending, startTransition] = useTransition();

	const searchParams = useSearchParams();
	const router = useRouter();
	const { push, replace, refresh, back, forward, prefetch } = router;

	const _push: typeof push = useCallback((...args) => startTransition(() => push(...args)), [push]);

	const _replace: typeof replace = useCallback((...args) => startTransition(() => replace(...args)), [replace]);

	const _refresh: typeof refresh = useCallback((...args) => startTransition(() => refresh(...args)), [refresh]);

	const _back: typeof back = useCallback((...args) => startTransition(() => back(...args)), [back]);

	const _forward: typeof forward = useCallback((...args) => startTransition(() => forward(...args)), [forward]);

	const _prefetch: typeof prefetch = useCallback((...args) => startTransition(() => prefetch(...args)), [prefetch]);

	const updateSearchParams = useCallback((
		params: Record<string, ParamValue> |
			((searchParamsObject: Record<string, string | string[]>) => Record<string, ParamValue>),
		action: 'push' | 'replace' = 'push',
	) =>
	{
		const search = searchParams.toString();
		const searchObject = queryString.parse(search) as Record<string, string | string[]>;

		const routerFn = action === 'replace' ? _replace : _push;

		routerFn(`?${queryString.stringify({
			...searchObject,
			...(typeof params === 'function' ? params(searchObject) : params),
		})}`);
	}, [searchParams, _push, _replace]);

	return {
		...router,
		isRouterTransitionPending: isPending,
		push: _push,
		replace: _replace,
		refresh: _refresh,
		back: _back,
		forward: _forward,
		prefetch: _prefetch,
		updateSearchParams,
	};
}
