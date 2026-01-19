'use client';

import { Fragment, Suspense as ReactSuspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorCard } from "./error-card";
import { Loader } from "./loader";

type ErrorComponentProps = {
    errors: string[];
};

const DefaultLoader = () => <Loader overlay />;

type Props = {
    children: React.ReactNode;
    loader?: React.ReactNode | React.ComponentType;
    ErrorComponent?: React.ComponentType<ErrorComponentProps>;
};

export function Suspense({
	children,
	loader: LoaderComponent = DefaultLoader,
}: Props)
{
	let loader: React.ReactNode = <Fragment />;

	if(typeof LoaderComponent === 'function')
	{
		loader = <LoaderComponent />;
	}
	else
	{
		loader = LoaderComponent;
	}

	return (
		<ReactSuspense fallback={loader}>
			<ErrorBoundary
				fallbackRender={({ error }) => {
					const message = error instanceof Error ? error.message : String(error);
					return <ErrorCard errors={[message]} />;
				}}
			>
				{children}
			</ErrorBoundary>
		</ReactSuspense>
	);
}
