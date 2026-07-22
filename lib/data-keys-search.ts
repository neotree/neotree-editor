import { normalizeSearchTerm } from "@/lib/search";

type SearchableDataKey = {
    name?: string | null;
    label?: string | null;
};

export function matchesDataKeySearch(dataKey: SearchableDataKey, searchValue: string) {
    const { normalizedValue, isQuotedSearch } = normalizeSearchTerm(searchValue, { doubleQuotesOnly: true });

    if (!normalizedValue) return true;

    return [dataKey.name || '', dataKey.label || ''].some(field =>
        isQuotedSearch
            ? field.includes(normalizedValue)
            : field.toLowerCase().includes(normalizedValue)
    );
}
