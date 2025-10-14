'use client';
import { Separator } from '@/components/ui/separator';
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


type DrugsFluidsTableHeaderProps = {
    searchQuery: string;
    typeFilter: string;
    statusFilter: string;
    sortBy: string;
    onSearchChange: (query: string) => void;
    onTypeFilterChange: (type: string) => void;
    onStatusFilterChange: (status: string) => void;
    onSortChange: (sort: string) => void;
};

export function DrugsFluidsTableHeaderForDrugs({
    typeFilter,
    statusFilter,
    sortBy,
    onTypeFilterChange,
    onStatusFilterChange,
    onSortChange,
}: DrugsFluidsTableHeaderProps) {
    return (
        <>
            <div className="p-4 flex flex-col gap-y-4">
                <div className="flex flex-wrap items-center">
                    <div className="text-2xl">Drugs & Fluids Library</div>
                    <div className="flex-1 flex flex-wrap items-center justify-end gap-x-4">
                        {/* Sort dropdown */}
                        <div>
                            <Select
                                value={sortBy}
                                onValueChange={onSortChange}
                            >
                                <SelectTrigger>
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
                                onValueChange={v => {
                                    if (v === 'all') {
                                        onTypeFilterChange('');
                                        onStatusFilterChange('');
                                    } else if (v === 'drug' || v === 'fluid') {
                                        onTypeFilterChange(v);
                                        onStatusFilterChange('');
                                    } else if (v === 'draft' || v === 'published') {
                                        onStatusFilterChange(v);
                                        onTypeFilterChange('');
                                    }
                                }}
                            >
                                <SelectTrigger>
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

            <Separator />
        </>
    );
}