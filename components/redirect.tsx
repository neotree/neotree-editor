'use client';

import { useEffect, useRef } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { useRouterWithTransition } from "@/hooks/use-router-with-transition";

type Props = {
    to: string;
    action?: 'push' | 'replace';
	reloadWindow?: boolean;
};

export function Redirect({
	action = 'push',
	to,
	reloadWindow = true,
}: Props): React.ReactNode
{
	const mounted = useRef(false);
	const router = useRouterWithTransition();

	useEffect(() =>
	{
		if(!mounted.current)
		{
			mounted.current = true;
			if(action === 'push') router.push(to);

			if(action === 'replace') router.replace(to);

			if(reloadWindow) setTimeout(() => window.location.reload(), 1000);
		}
	}, [to, action, router, reloadWindow]);

	return <ProgressBar />;
}
