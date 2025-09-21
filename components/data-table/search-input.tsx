'use client';

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<'input'> & {
    hideSearchButton?: boolean;
    searchButton?: React.ComponentProps<'button'>;
};

const SearchInput = forwardRef<HTMLInputElement, Props>(({
	searchButton,
	hideSearchButton,
	...props
}, ref) =>
{
	return (
		<>
			<div
				className={cn(
					'flex w-full'
				)}
			>
				<div
					className={cn(
						'relative w-full'
					)}
				>
					<input
						ref={ref}
						type="search"
						placeholder="Search"
						{...props}
						className={cn(
							'w-full pl-4 py-2 rounded-l-full border focus:outline-none focus:border-secondary bg-transparent',
							props.className,
						)}
					/>
				</div>

				{!hideSearchButton && (
					<button
						type="button"
						className={cn(
							'px-5 py-2.5 transition-colors bg-transparent border border-l-0 rounded-r-full hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed',
							searchButton?.className
						)}
						{...searchButton}
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
							<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
						</svg>
					</button>
				)}
			</div>
		</>
	);
});

SearchInput.displayName = 'SearchInput';

export { SearchInput, };
