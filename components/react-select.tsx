'use client';

import React, { forwardRef, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import Select, { type Props as SelectProps } from 'react-select';
import { Label } from '@/components/ui/label';

export type ReactSelectProps = SelectProps & {
    label?: string;
    error?: string;
    helperText?: string;
};

export const reactSelectStyles: ReactSelectProps['styles'] = {
	control: (styles, { isFocused, menuIsOpen, }) => ({
		...styles,
		backgroundColor: 'transparent',
		boxShadow: 'none',
		outline: 'none',
		border: '1px solid hsl(var(--input))',
		'&:hover': {
			boxShadow: 'none',
			outline: 'hsl(var(--ring)) auto 4px',
			outlineOffset: 5,
		},
		'&:focus': {
			outline: 'hsl(var(--ring)) auto 4px',
			outlineOffset: 5,
		},
		...(!(isFocused || menuIsOpen) ? null : {
			outline: 'hsl(var(--ring)) auto 4px',
			outlineOffset: 5,
		}),
	}),

	menu: (styles) => ({
		...styles,
		background: 'hsl(var(--background))',
	}),
};

export const reactSelectClasses: ReactSelectProps['classNames'] = {
	control: ({ isDisabled }) => cn(
		'react-slct-ctrl focus:outline-none text-foreground min-h-10',
		isDisabled && 'opacity-50',
	),
	valueContainer: ({ hasValue }) => cn(
		'react-slct-val-container',
		!hasValue ? 'react-slct-val-container-muted' : 'react-slct-val-container-foreground',
	),
	option: ({ isFocused, isDisabled, isSelected, }) => cn(
		'react-slct-opt transition-colors hover:bg-accent active:bg-accent',
		isSelected && 'react-slct-opt-selected',
		isFocused && 'react-slct-opt-focused',
		isDisabled && 'opacity-50',
	),
};

export const reactSelectContainerClassName = cn(
	`bg-background text-foreground
    [&_input]:text-foreground [&_.react-slct-ctrl]:text-foreground
    [&_.react-slct-val-container-foreground>*]:text-foreground [&_.react-slct-val-container-muted>*]text-muted
    [&_.react-slct-opt-selected]:bg-accent [&_.react-slct-opt-selected]:text-foreground
    [&_.react-slct-opt-focused]:bg-accent [&_.react-slct-opt-focused]:text-foreground`
);

export const ReactSelect = forwardRef<any, ReactSelectProps>(({
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
				<Select
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

ReactSelect.displayName = 'ReactSelect';
