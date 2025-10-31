import * as schema from '@/databases/pg/schema';
import { ArrayElement, Preferences } from '@/types';

type DrizzleDrugsLibrary = typeof schema.drugsLibrary.$inferSelect;

export type DrugsLibrarySearchSourceItem = (DrizzleDrugsLibrary & {
    isDraft?: boolean;
    draftCreatedByUserId?: string | null;
    preferences?: Preferences | null;
}) & {
    itemId: string;
};

export type DrugsLibrarySearchField =
    | 'title'
    | 'type'
    | 'key'
    | 'keyId'
    | 'gestationKey'
    | 'gestationKeyId'
    | 'weightKey'
    | 'weightKeyId'
    | 'diagnosisKey'
    | 'diagnosisKeyId'
    | 'ageKey'
    | 'ageKeyId'
    | 'dosageText'
    | 'managementText'
    | 'administrationFrequency'
    | 'routeOfAdministration'
    | 'condition'
    | 'preferenceKey'
    | 'preferenceValue';

const fieldLabels: Record<DrugsLibrarySearchField, string> = {
    title: 'Title',
    type: 'Type',
    key: 'Key',
    keyId: 'Key ID',
    gestationKey: 'Gestation key',
    gestationKeyId: 'Gestation key ID',
    weightKey: 'Weight key',
    weightKeyId: 'Weight key ID',
    diagnosisKey: 'Diagnosis key',
    diagnosisKeyId: 'Diagnosis key ID',
    ageKey: 'Age key',
    ageKeyId: 'Age key ID',
    dosageText: 'Dosage text',
    managementText: 'Management text',
    administrationFrequency: 'Administration frequency',
    routeOfAdministration: 'Route of administration',
    condition: 'Conditional expression',
    preferenceKey: 'Preference key',
    preferenceValue: 'Preference value',
};

export type DrugsLibrarySearchMatch = {
    field: DrugsLibrarySearchField;
    fieldLabel: string;
    fieldValue: string;
    context?: string;
};

export type DrugsLibrarySearchResultsItem = {
    itemId: string;
    title: string;
    type: string;
    isDraft: boolean;
    matches: DrugsLibrarySearchMatch[];
};

export function parseDrugsLibrarySearchResults({
    searchValue,
    items,
}: {
    searchValue: string;
    items: DrugsLibrarySearchSourceItem[];
}): DrugsLibrarySearchResultsItem[] {
    const search = `${searchValue || ''}`.trim().toLowerCase();
    if (!search) return [];

    return items.reduce<DrugsLibrarySearchResultsItem[]>((acc, item) => {
        const matches: DrugsLibrarySearchMatch[] = [];
        const seen = new Set<string>();

        const addMatch = (
            field: DrugsLibrarySearchField,
            rawValue: unknown,
            context?: string,
        ) => {
            const stringValue = `${rawValue ?? ''}`.trim();
            if (!stringValue) return;

            if (!stringValue.toLowerCase().includes(search)) return;

            const key = `${field}:${stringValue}:${context || ''}`;
            if (seen.has(key)) return;
            seen.add(key);

            matches.push({
                field,
                fieldLabel: fieldLabels[field],
                fieldValue: stringValue,
                ...(context ? { context } : {}),
            });
        };

        const fieldMap: Array<[DrugsLibrarySearchField, unknown]> = [
            ['title', item.drug],
            ['type', item.type],
            ['key', item.key],
            ['keyId', item.keyId],
            ['gestationKey', item.gestationKey],
            ['gestationKeyId', item.gestationKeyId],
            ['weightKey', item.weightKey],
            ['weightKeyId', item.weightKeyId],
            ['diagnosisKey', item.diagnosisKey],
            ['diagnosisKeyId', item.diagnosisKeyId],
            ['ageKey', item.ageKey],
            ['ageKeyId', item.ageKeyId],
            ['dosageText', item.dosageText],
            ['managementText', item.managementText],
            ['administrationFrequency', item.administrationFrequency],
            ['routeOfAdministration', item.routeOfAdministration],
            ['condition', item.condition],
        ];

        fieldMap.forEach(([field, value]) => addMatch(field, value));

        const preferences = item.preferences;
        if (preferences) {
            const preferenceGroups = Object.entries(preferences) as Array<[keyof Preferences, Preferences[keyof Preferences]]>;
            preferenceGroups.forEach(([group, preferenceMap]) => {
                if (!preferenceMap) return;
                Object.entries(preferenceMap).forEach(([prefKey, prefValue]) => {
                    addMatch('preferenceKey', prefKey, group);
                    if (typeof prefValue === 'string' || typeof prefValue === 'number') {
                        addMatch('preferenceValue', prefValue, group);
                    } else if (Array.isArray(prefValue)) {
                        addMatch('preferenceValue', prefValue.join(', '), group);
                    }
                });
            });
        }

        if (matches.length && item.itemId) {
            acc.push({
                itemId: item.itemId,
                title: `${item.drug || ''}`,
                type: `${item.type || ''}`,
                isDraft: !!item.isDraft,
                matches,
            });
        }

        return acc;
    }, []);
}

export const drugsLibrarySearchResultsFilters = [
    {
        value: 'all',
        label: 'All matches',
    },
    {
        value: 'data_key',
        label: 'Data keys only',
    },
    {
        value: 'key_id',
        label: 'Key IDs only',
    },
    {
        value: 'label',
        label: 'Label text only',
    },
    {
        value: 'title',
        label: 'Title only',
    },
    {
        value: 'condition',
        label: 'Conditional expression only',
    },
] as const;

export type DrugsLibrarySearchResultsFilter = ArrayElement<typeof drugsLibrarySearchResultsFilters>['value'];

const matchedFieldFilterMap: Partial<Record<DrugsLibrarySearchField, DrugsLibrarySearchResultsFilter>> = {
    key: 'data_key',
    gestationKey: 'data_key',
    weightKey: 'data_key',
    diagnosisKey: 'data_key',
    ageKey: 'data_key',
    preferenceKey: 'data_key',

    keyId: 'key_id',
    gestationKeyId: 'key_id',
    weightKeyId: 'key_id',
    diagnosisKeyId: 'key_id',
    ageKeyId: 'key_id',

    title: 'title',

    dosageText: 'label',
    managementText: 'label',
    administrationFrequency: 'label',
    routeOfAdministration: 'label',
    type: 'label',
    preferenceValue: 'label',

    condition: 'condition',
};

export function filterDrugsLibrarySearchResults({
    searchValue,
    filter,
    results,
}: {
    searchValue: string;
    filter: DrugsLibrarySearchResultsFilter;
    results: DrugsLibrarySearchResultsItem[];
}) {
    if (filter === 'all') return results;

    const filtered = results.map(result => {
        const matches = result.matches.filter(match => {
            if (!filter) return true;

            const matchedFilter = matchedFieldFilterMap[match.field];
            if (matchedFilter !== filter) return false;

            if (!`${match.fieldValue}`.toLowerCase().includes(`${searchValue}`.toLowerCase())) return false;

            return true;
        });

        return {
            ...result,
            matches,
        };
    }).filter(result => result.matches.length);

    return filtered;
}
