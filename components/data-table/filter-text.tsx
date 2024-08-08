import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, ArrowUp, ArrowDown, EyeOff, LucideIcon } from 'lucide-react';

import { FilterValue, TableStateDataColumn } from "./types";
import { cn } from "@/lib/utils";

const options = [
    {
        value: 'asc',
        label: 'Asc',
        Icon: ArrowUp,
    },
    {
        value: 'desc',
        label: 'Desc',
        Icon: ArrowDown,
    },
    {
        value: 'hide',
        label: 'Hide',
        divider: true,
        Icon: EyeOff,
    },
];

type Props = {
    column: TableStateDataColumn;
    value: FilterValue | 'hide';
    onFilter: (value: FilterValue | 'hide') => void;
};

export const FilterText = ({ column, value, onFilter }: Props) => {
    const selected = options.filter(o => o.value === value)[0];
    const Icon = selected?.Icon || ChevronsUpDown;

    return ( 
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="
                        focus-visible:ring-0 
                        focus-visible:ring-transparent 
                        focus-visible:ring-offset-0
                    "
                >
                    <span className="mr-2">{column.name}</span>
                    <Icon className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {options
                    .filter(o => o.value === 'hide' ? (column.canHide !== false) : true)
                    .map(o => {
                        return (
                            <DropdownMenuItem 
                                key={o.value}
                                onClick={() => onFilter(o.value as FilterValue)}
                                className={cn(
                                    o.divider ? 'border-t' : ''
                                )}
                            >
                                <o.Icon className="w-4 h-4 mr-2" />
                                {o.label}
                            </DropdownMenuItem>
                        )
                    })
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
