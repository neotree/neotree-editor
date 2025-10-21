import {
    Select,
    SelectGroup,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectSeparator,
} from '@/components/ui/select';

type DrugsLibraryHeaderProps = {
    sortBy: string;
    typeFilter: string;
    statusFilter: string;
    onSortChange: (value: string) => void;
    onFilterChange: (type: string, status: string) => void;
};

export function DrugsLibraryHeader({
    sortBy,
    typeFilter,
    statusFilter,
    onSortChange,
    onFilterChange,
}: DrugsLibraryHeaderProps) {
    const handleFilterChange = (value: string) => {
        if (value === 'all') {
            onFilterChange('', '');
        } else if (value === 'drug' || value === 'fluid') {
            onFilterChange(value, '');
        } else if (value === 'draft' || value === 'published') {
            onFilterChange('', value);
        }
    };

    return (
        <div className="p-4 flex flex-col gap-y-4">
            <div className="flex flex-wrap items-center">
                <div className="text-2xl">Drugs & Fluids Library</div>
                <div className="flex-1 flex flex-wrap items-center justify-end gap-x-4">
                    {/* Sort dropdown */}
                    <div>
                        <Select value={sortBy} onValueChange={onSortChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                <SelectItem value="type-asc">Type (A-Z)</SelectItem>
                                <SelectItem value="type-desc">Type (Z-A)</SelectItem>
                                <SelectItem value="key-asc">Key (A-Z)</SelectItem>
                                <SelectItem value="key-desc">Key (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter dropdown */}
                    <div>
                        <Select
                            value={typeFilter || statusFilter || 'all'}
                            onValueChange={handleFilterChange}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All items" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All items</SelectItem>

                                <SelectSeparator />

                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectGroup>

                                <SelectSeparator />

                                <SelectGroup>
                                    <SelectLabel>Types</SelectLabel>
                                    <SelectItem value="drug">Drugs</SelectItem>
                                    <SelectItem value="fluid">Fluids</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}