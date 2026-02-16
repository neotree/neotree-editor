import * as schema from '@/databases/pg/schema';
import { ScriptField, ArrayElement } from '@/types';
import { escapeRegex, normalizeSearchTerm } from "@/lib/search";

type Script = typeof schema.scripts.$inferSelect & {
    isDraft: boolean;
};

type Screen = typeof schema.screens.$inferSelect & {
    isDraft: boolean;
};

type Diagnosis = typeof schema.diagnoses.$inferSelect & {
    isDraft: boolean;
};

export type ScriptsSearchResultsItem = {
    scriptId: string;
    title: string;
    position: number;
    matches: {
        field: string;
        fieldIndex?: number;
        fieldItemIndex?: number;
        fieldValue: string;
    }[];
    screens: {
        title: string;
        isDraft: boolean;
        screenId: string;
        fields: { label: string; type: string, }[];
        matches: ScriptsSearchResultsItem['matches'];
        position: number;
    }[];
    diagnoses: {
        title: string;
        isDraft: boolean;
        diagnosisId: string;
        fields: { label: string; type: string, }[];
        matches: ScriptsSearchResultsItem['matches'];
        position: number;
    }[];
};

export type ParseScriptsSearchResultsParams = {
    searchValue: string;
    scripts: Script[];
    screens: (Screen & {
        scriptTitle: string;
        scriptPosition: number;
    })[];
    diagnoses: (Diagnosis & {
        scriptTitle: string;
        scriptPosition: number;
    })[];
};

export function parseScriptsSearchResults({
    searchValue,
    scripts,
    screens,
    diagnoses,
}: ParseScriptsSearchResultsParams): ScriptsSearchResultsItem[] {
    const { normalizedValue, isExactMatch } = normalizeSearchTerm(searchValue);

    if (!normalizedValue) {
        return [];
    }

    const escapedSearchValue = escapeRegex(normalizedValue);
    const pattern = isExactMatch ? `^${escapedSearchValue}$` : escapedSearchValue;
    const searchRegex = new RegExp(pattern, isExactMatch ? "" : "i");
    const manualEntrySearchText = 'manual entry enter value manually custom value other specify';

    const resultsMap: Record<string, ScriptsSearchResultsItem> = {};

    scripts.forEach(s => {
        const matches: ScriptsSearchResultsItem['matches'] = [];

        if (`${s.title || ''}`.match(searchRegex)) {
            matches.push({
                field: 'title',
                fieldValue: s.title,
            });
        }

        if (`${s.printTitle || ''}`.match(searchRegex)) {
            matches.push({
                field: 'printTitle',
                fieldValue: s.printTitle,
            });
        }

        if (matches.length) {
            resultsMap[s.scriptId] = {
                title: s.title,
                scriptId: s.scriptId,
                position: s.position,
                diagnoses: [],
                screens: [],
                matches,
            };
        }
    });

    screens.forEach(s => {
        const matches: ScriptsSearchResultsItem['matches'] = [];

        if (`${s.title || ''}`.match(searchRegex)) {
            matches.push({
                field: 'title',
                fieldValue: s.title,
            });
        }

        if (`${s.key || ''}`.match(searchRegex)) {
            matches.push({
                field: 'key',
                fieldValue: s.key!,
            });
        }

        if (`${s.refId || ''}`.match(searchRegex)) {
            matches.push({
                field: 'refId',
                fieldValue: `${s.refId || ''}`,
            });
        }

        if (`${s.label || ''}`.match(searchRegex)) {
            matches.push({
                field: 'label',
                fieldValue: s.label!,
            });
        }

        if (`${s.sectionTitle || ''}`.match(searchRegex)) {
            matches.push({
                field: 'sectionTitle',
                fieldValue: s.sectionTitle!,
            });
        }

        if (`${s.previewTitle || ''}`.match(searchRegex)) {
            matches.push({
                field: 'previewTitle',
                fieldValue: s.previewTitle!,
            });
        }

        if (`${s.previewPrintTitle || ''}`.match(searchRegex)) {
            matches.push({
                field: 'previewPrintTitle',
                fieldValue: s.previewPrintTitle!,
            });
        }

        if (`${s.condition || ''}`.match(searchRegex)) {
            matches.push({
                field: 'condition',
                fieldValue: s.condition!,
            });
        }

        (s.fields || []).map((f: ScriptField, i) => {
            if (`${f.key || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'field_key',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }

            if (`${f.label || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'field_label',
                    fieldIndex: i,
                    fieldValue: f.label,
                });
            }

            if (`${f.condition || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'field_condition',
                    fieldIndex: i,
                    fieldValue: f.condition,
                });
            }

            (f.items || []).map((f, j) => {
                if (`${f.value || ''}`.match(searchRegex)) {
                    matches.push({
                        field: 'field_item_key',
                        fieldIndex: i,
                        fieldItemIndex: j,
                        fieldValue: f.value as string,
                    });
                }

                if (`${f.label || ''}`.match(searchRegex)) {
                    matches.push({
                        field: 'field_item_label',
                        fieldIndex: i,
                        fieldItemIndex: j,
                        fieldValue: f.label as string,
                    });
                }

                if (f.enterValueManually && manualEntrySearchText.match(searchRegex)) {
                    matches.push({
                        field: 'field_item_manual_entry',
                        fieldIndex: i,
                        fieldItemIndex: j,
                        fieldValue: 'Enter value manually',
                    });
                }

                if (`${f.enterValueManuallyLabel || ''}`.match(searchRegex)) {
                    matches.push({
                        field: 'field_item_manual_label',
                        fieldIndex: i,
                        fieldItemIndex: j,
                        fieldValue: `${f.enterValueManuallyLabel || ''}`,
                    });
                }
            });
        });

        (s.items || []).map((f, i) => {
            if (`${f.id || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'item_id',
                    fieldIndex: i,
                    fieldValue: f.id,
                });
            }

            if (`${f.key || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'item_key',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }

            if (`${f.label || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'item_label',
                    fieldIndex: i,
                    fieldValue: f.label,
                });
            }

            if (f.enterValueManually && manualEntrySearchText.match(searchRegex)) {
                matches.push({
                    field: 'item_manual_entry',
                    fieldIndex: i,
                    fieldValue: 'Enter value manually',
                });
            }

            if (`${f.enterValueManuallyLabel || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'item_manual_label',
                    fieldIndex: i,
                    fieldValue: `${f.enterValueManuallyLabel || ''}`,
                });
            }
        });

        (s.drugs || []).map((f, i) => {
            if (`${f.key || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'drug',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }
        });

        (s.fluids || []).map((f, i) => {
            if (`${f.key || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'fluid',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }
        });

        (s.feeds || []).map((f, i) => {
            if (`${f.key || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'feed',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }
        });

        if (matches.length) {
            resultsMap[s.scriptId] = resultsMap[s.scriptId] || {
                title: '',
                scriptId: s.scriptId,
                position: s.scriptPosition,
                diagnoses: [],
                screens: [],
                matches: [],
            } satisfies ScriptsSearchResultsItem;

            resultsMap[s.scriptId].title = resultsMap[s.scriptId].title || s.scriptTitle;

            resultsMap[s.scriptId].screens.push({
                title: s.title,
                matches,
                screenId: s.screenId,
                isDraft: s.isDraft,
                position: s.position,
                fields: [
                    ...s.items.map(f => ({
                        label: f.label,
                        type: 'item',
                    })),
                    ...s.fields.map(f => ({
                        label: f.label,
                        type: 'field',
                    })),
                ],
            });
        }
    });

    diagnoses.forEach(s => {
        const matches: ScriptsSearchResultsItem['matches'] = [];

        if (`${s.name || ''}`.match(searchRegex)) {
            matches.push({
                field: 'name',
                fieldValue: s.name!,
            });
        }

        if (`${s.key || ''}`.match(searchRegex)) {
            matches.push({
                field: 'key',
                fieldValue: s.key!,
            });
        }

        if (`${s.expression || ''}`.match(searchRegex)) {
            matches.push({
                field: 'expression',
                fieldValue: s.expression!,
            });
        }

        (s.symptoms || []).map((f, i) => {
            if (`${f.key || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'diagnosis_symptom_key',
                    fieldIndex: i,
                    fieldValue: f.key!,
                });
            }

            if (`${f.name || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'diagnosis_symptom_name',
                    fieldIndex: i,
                    fieldValue: f.name,
                });
            }

            if (`${f.expression || ''}`.match(searchRegex)) {
                matches.push({
                    field: 'diagnosis_symptom_expression',
                    fieldIndex: i,
                    fieldValue: f.expression,
                });
            }
        });

        if (matches.length) {
            resultsMap[s.scriptId] = resultsMap[s.scriptId] || {
                title: '',
                scriptId: s.scriptId,
                position: s.scriptPosition,
                diagnoses: [],
                screens: [],
                matches: [],
            } satisfies ScriptsSearchResultsItem;

            resultsMap[s.scriptId].title = resultsMap[s.scriptId].title || s.scriptTitle;

            resultsMap[s.scriptId].diagnoses.push({
                title: s.name || '',
                position: s.position,
                matches,
                diagnosisId: s.diagnosisId,
                isDraft: s.isDraft,
                fields: [
                    ...s.symptoms.map(f => ({
                        label: f.name,
                        type: 'diagnosis_symptom',
                    })),
                ],
            });
        }
    });

    return Object.values(resultsMap);
}

export const scriptsSearchResultsFilters = [
    {
        value: 'all',
        label: 'All matches',
    },
    {
        value: 'ref_id',
        label: 'Ref ID only',
    },
    {
        value: 'data_key',
        label: 'Data keys only',
    },
    {
        value: 'label',
        label: 'Label only',
    },
    {
        value: 'title',
        label: 'Title only',
    },
    {
        value: 'condition',
        label: 'Conditional expression only',
    },
    {
        value: 'manual_entry',
        label: 'Manual entry only',
    },
] as const;

export type ScriptsSearchResultsFilter = ArrayElement<typeof scriptsSearchResultsFilters>['value'];

const matchedFieldFilterMap: Record<string, string> = {
    key: 'data_key',
    field_key: 'data_key',
    field_item_key: 'data_key',
    field_id: 'data_key',
    item_id: 'data_key',
    item_key: 'data_key',
    refId: 'ref_id',
    title: 'title',
    label: 'label',
    field_label: 'label',
    field_item_label: 'label',
    item_label: 'label',
    condition: 'condition',
    field_condition: 'condition',
    item_condition: 'condition',
    field_item_manual_entry: 'manual_entry',
    item_manual_entry: 'manual_entry',
    field_item_manual_label: 'manual_entry',
    item_manual_label: 'manual_entry',
};

export function filterScriptsSearchResults({ searchValue, filter, results, }: {
    searchValue: string;
    filter: ScriptsSearchResultsFilter;
    results: ScriptsSearchResultsItem[];
}) {
    if (filter === 'all') return results;
    
    const filterFn = (m: ScriptsSearchResultsItem['matches'][0]) => {
        if (matchedFieldFilterMap[m.field] !== filter) return false;
        // if (!`${m.fieldValue || ''}`.toLowerCase().includes(`${searchValue || ''}`.toLowerCase())) return false;
        return true;
    }
    const filtered = results.map(r => {
        return !filter ? r : {
            ...r,
            matches: r.matches.filter(m => filterFn(m)),
            screens: r.screens.filter(s => s.matches.find(m => filterFn(m))).map(s => {
                return {
                    ...s,
                    matches: s.matches.filter(m => filterFn(m)),
                };
            }),
            diagnoses: r.diagnoses.filter(s => s.matches.find(m => filterFn(m))).map(s => {
                return {
                    ...s,
                    matches: s.matches.filter(m => filterFn(m)),
                };
            }),  
        };
    }).filter(r => (
        r.matches.length ||
        r.screens.length ||
        r.diagnoses.length
    ));

    return filtered;
}

