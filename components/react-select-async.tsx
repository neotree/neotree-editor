'use client';

import React, { forwardRef, useEffect, useState } from 'react';

import AsyncSelect, { type AsyncProps, } from 'react-select/async';
import { Label } from '@/components/ui/label';
import { reactSelectContainerClassName, reactSelectClasses, reactSelectStyles } from './react-select';

export type ReactSelectAsyncProps = AsyncProps<any, boolean, any> & {
    label?: string;
    error?: string;
    helperText?: string;
};

;

export const ReactSelectAsync = forwardRef<any, ReactSelectAsyncProps>(({
	label,
	error,
	helperText,
	...props
}, ref) =>
{
	const [isClient, setIsClient] = useState(false);

	useEffect(() =>
	{
		setIsClient(typeof window !== undefined);
	}, []);

	if(!isClient) return null;

	return (
		<>
			{!!label && <Label htmlFor={props.name} className="mb-1">{label}{props.required ? ' *' : ''}</Label>}

			<div
				className={reactSelectContainerClassName}
			>
				<AsyncSelect
					ref={ref}
					{...props}
					classNames={reactSelectClasses}
					styles={reactSelectStyles}
				/>
			</div>

			{!!error ? <p className="text-sm text-destructive mt-2">{error}</p> : (
				!!helperText && <p className="opacity-50 mt-2">{helperText}</p>
			)}
		</>
	);
});

ReactSelectAsync.displayName = 'ReactSelectAsync';
