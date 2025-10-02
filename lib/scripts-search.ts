import * as schema from '@/databases/pg/schema';
import { ScriptField, ArrayElement } from '@/types';

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
    matches: {
        field: string;
        fieldIndex?: number;
        fieldValue: string;
    }[];
    screens: {
        title: string;
        isDraft: boolean;
        screenId: string;
        matches: ScriptsSearchResultsItem['matches'];
    }[];
    diagnoses: {
        title: string;
        isDraft: boolean;
        diagnosisId: string;
        matches: ScriptsSearchResultsItem['matches'];
    }[];
};

export type ParseScriptsSearchResultsParams = {
    searchValue: string;
    scripts: Script[];
    screens: Screen[];
    diagnoses: Diagnosis[];
};

export function parseScriptsSearchResults({
    searchValue,
    scripts,
    screens,
    diagnoses,
}: ParseScriptsSearchResultsParams): ScriptsSearchResultsItem[] {
    searchValue = `${searchValue || ''}`.trim().toLowerCase();

    const resultsMap: Record<string, ScriptsSearchResultsItem> = {};

    scripts.forEach(s => {
        const matches: ScriptsSearchResultsItem['matches'] = [];

        if (`${s.title || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'title',
                fieldValue: s.title,
            });
        }

        if (`${s.printTitle || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'printTitle',
                fieldValue: s.printTitle,
            });
        }

        if (matches.length) {
            resultsMap[s.scriptId] = {
                title: s.title,
                scriptId: s.scriptId,
                diagnoses: [],
                screens: [],
                matches,
            };
        }
    });

    screens.forEach(s => {
        const matches: ScriptsSearchResultsItem['matches'] = [];

        if (`${s.title || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'title',
                fieldValue: s.title,
            });
        }

        if (`${s.key || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'key',
                fieldValue: s.key!,
            });
        }

        if (`${s.refId || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'refId',
                fieldValue: `${s.refId || ''}`,
            });
        }

        if (`${s.label || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'label',
                fieldValue: s.label!,
            });
        }

        if (`${s.sectionTitle || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'sectionTitle',
                fieldValue: s.sectionTitle!,
            });
        }

        if (`${s.previewTitle || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'previewTitle',
                fieldValue: s.previewTitle!,
            });
        }

        if (`${s.previewPrintTitle || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'previewPrintTitle',
                fieldValue: s.previewPrintTitle!,
            });
        }

        (s.fields || []).map((f: ScriptField, i) => {
            if (`${f.key || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'field_key',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }

            if (`${f.label || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'field_label',
                    fieldIndex: i,
                    fieldValue: f.label,
                });
            }
        });

        (s.items || []).map((f, i) => {
            if (`${f.id || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'item_id',
                    fieldIndex: i,
                    fieldValue: f.id,
                });
            }

            if (`${f.key || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'item_key',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }

            if (`${f.label || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'item_label',
                    fieldIndex: i,
                    fieldValue: f.label,
                });
            }
        });

        (s.drugs || []).map((f, i) => {
            if (`${f.key || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'drug',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }
        });

        (s.fluids || []).map((f, i) => {
            if (`${f.key || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'fluid',
                    fieldIndex: i,
                    fieldValue: f.key,
                });
            }
        });

        (s.feeds || []).map((f, i) => {
            if (`${f.key || ''}`.toLowerCase().match(searchValue)) {
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
                diagnoses: [],
                screens: [],
                matches: [],
            } satisfies ScriptsSearchResultsItem;

            resultsMap[s.scriptId].screens.push({
                title: s.title,
                matches,
                screenId: s.screenId,
                isDraft: s.isDraft,
            });
        }
    });

    diagnoses.forEach(s => {
        const matches: ScriptsSearchResultsItem['matches'] = [];

        if (`${s.name || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'name',
                fieldValue: s.name!,
            });
        }

        if (`${s.key || ''}`.toLowerCase().match(searchValue)) {
            matches.push({
                field: 'key',
                fieldValue: s.key!,
            });
        }

        (s.symptoms || []).map((f, i) => {
            if (`${f.key || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'diagnosis_symptom_key',
                    fieldIndex: i,
                    fieldValue: f.key!,
                });
            }

            if (`${f.name || ''}`.toLowerCase().match(searchValue)) {
                matches.push({
                    field: 'diagnosis_symptom_name',
                    fieldIndex: i,
                    fieldValue: f.name,
                });
            }
        });

        if (matches.length) {
            resultsMap[s.scriptId] = resultsMap[s.scriptId] || {
                title: '',
                scriptId: s.scriptId,
                diagnoses: [],
                screens: [],
                matches: [],
            } satisfies ScriptsSearchResultsItem;

            resultsMap[s.scriptId].diagnoses.push({
                title: s.name || '',
                matches,
                diagnosisId: s.diagnosisId,
                isDraft: s.isDraft,
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
        label: 'Ref only',
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
] as const;

export type ScriptsSearchResultsFilter = ArrayElement<typeof scriptsSearchResultsFilters>['value'];

export function filterScriptsSearchResults(
    filter: ScriptsSearchResultsFilter,
    results: ScriptsSearchResultsItem[],
) {
    if (filter === 'all') return results;
    
    const filterFn = (m: ScriptsSearchResultsItem['matches'][0]) => {
        if (filter === 'data_key') {
            return (
                m.field === 'key' ||
                m.field === 'field_key' ||
                m.field === 'field_id' ||
                m.field === 'item_id' ||
                m.field === 'item_key'
            );
        }

        if (filter === 'ref_id') {
            return (
                m.field === 'refId'
            );
        }

        if (filter === 'title') {
            return (
                m.field === 'title'
            );
        }

        if (filter === 'label') {
            return (
                m.field === 'label'
            );
        }
    }
    return results.map(r => {
        return !filter ? r : {
            ...r,
            matches: r.matches.filter(m => filterFn(m)),
            screens: r.screens.filter(s => s.matches.find(m => filterFn(m))),
            diagnoses: r.diagnoses.filter(s => s.matches.find(m => filterFn(m))),  
        };
    }).filter(r => (
        r.matches.length ||
        r.screens.length ||
        r.diagnoses.length
    ));
}
