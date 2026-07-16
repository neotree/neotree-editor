import { normalizeSearchTerm } from "@/lib/search";

type SearchableDataKey = {
    name?: string | null;
    label?: string | null;
};

export function matchesDataKeySearch(dataKey: SearchableDataKey, searchValue: string) {
    const { normalizedValue, isExactMatch } = normalizeSearchTerm(searchValue);

    if (!normalizedValue) return true;

    return [dataKey.name || '', dataKey.label || ''].some(field =>
        isExactMatch
            ? field === normalizedValue
            : field.toLowerCase().includes(normalizedValue)
    );
}
