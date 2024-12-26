import { and, inArray, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { scripts, screens, hospitals } from "@/databases/pg/schema";
import { ScriptField, ScriptItem } from "@/types";

export type GetScriptsMetadataParams = {
    scriptsIds?: string[];
    hospitalsIds?: string[];
    returnDraftsIfExist?: boolean;
};

export type GetScriptsMetadataResponse = {
    data: {
        scriptId: typeof scripts.$inferSelect['scriptId'];
        title: string;
        hospitalName: string;
        screens: {
            screenId: string;
            type: typeof screens.$inferSelect['type'];
            title: string;
            ref: string;
            fields: {
                label: string;
                key: string;
                type: string;
                dataType: string | null;
                value: any;
                valueLabel: null | string;
            }[];
        }[];
    }[],
    errors?: string[];
};

export async function _getScriptsMetadata(params?: GetScriptsMetadataParams): Promise<GetScriptsMetadataResponse> {
    try {
        const {
            scriptsIds = [],
            hospitalsIds = [],
            returnDraftsIfExist,
        } = { ...params };

        const hospitalsArr = await db.query.hospitals.findMany({
            where: and(
                isNull(hospitals.deletedAt),
            ),
        });

        const whereScriptsIds = !scriptsIds.length ? undefined : inArray(scripts.scriptId, scriptsIds);
        const whereHospitalsIds = !hospitalsIds.length ? undefined : inArray(scripts.hospitalId, hospitalsIds);

        const where = [
            whereScriptsIds,
            whereHospitalsIds,
        ];

        let scriptsRes = await db.query.scripts.findMany({
            where: where.length ? and(...where) : undefined,
            with: {
                draft: !returnDraftsIfExist ? undefined : true,
                screens: {
                    with: {
                        draft: !returnDraftsIfExist ? undefined : true,
                    },
                },
            },
        });

        scriptsRes = scriptsRes
            .map(s => ({
                ...s,
                ...(returnDraftsIfExist && s.draft ? s.draft.data : null),
                screens: s.screens
                    .sort((a, b) => a.position - b.position),
            }))
            .sort((a, b) => a.position - b.position);

        const data: GetScriptsMetadataResponse['data'] = [];

        scriptsRes.forEach(script => {
            const hospital = hospitalsArr.filter(h => h.hospitalId === script.hospitalId)[0];

            data.push({
                scriptId: script.scriptId,
                title: script.title,
                hospitalName: hospital?.name || '',
                screens: script.screens.map(screen => {
                    const items = screen.items as ScriptItem[];
                    const screenFields = screen.fields as ScriptField[];

                    let fields: (GetScriptsMetadataResponse['data'][0]['screens'][0]['fields'][0] & {
                        dataType: string | null;
                    })[] = [{
                        label: screen.label,
                        key: screen.key,
                        type: screen.type,
                        ...(() => {
                            switch(screen.type) {
                                case 'single_select':
                                    return {
                                        dataType: 'single_select_option',
                                        value: null,
                                        valueLabel: null,
                                    };
                                default:
                                    return {
                                        dataType: screen.dataType,
                                        value: null,
                                        valueLabel: null,
                                    };
                            }
                        })(),
                    }];

                    switch(screen.type) {
                        case 'progress':
                        case 'edliz_summary_table':
                        case 'mwi_edliz_summary_table':
                        case 'zw_edliz_summary_table':
                        case 'management':
                            fields = [];
                            break;

                        case 'yesno':
                            fields = [
                                { value: 'true', label: screen.positiveLabel || 'Yes', },
                                { value: 'false', label: screen.negativeLabel || 'Yes', },
                            ].map(o => {
                                return {
                                    label: screen.label,
                                    key: screen.key,
                                    type: screen.type,
                                    dataType: 'boolean',
                                    value: o.value,
                                    valueLabel: o.label,
                                };
                            });
                            break;

                        case 'diagnosis':
                            fields = items.map(item => ({
                                value: item.id,
                                valueLabel: item.label,
                                label: item.label,
                                key: item.id,
                                type: screen.type,
                                dataType: 'diagnosis',
                            }));
                            break;

                        case 'checklist':
                            fields = items.map(item => ({
                                value: item.id,
                                valueLabel: item.label,
                                label: item.label,
                                key: item.key,
                                type: screen.type,
                                dataType: null,
                            }));
                            break;

                        case 'form':
                            const formFields = screenFields.map(f => {
                                let dataType = f.dataType;

                                switch(f.type) {
                                    case 'datetime':
                                        dataType = 'datetime';
                                        break;
                                    case 'date':
                                        dataType = 'date';
                                        break;
                                    case 'time':
                                        dataType = 'time';
                                        break;
                                    case 'dropdown':
                                        dataType = 'dropdown';
                                        break;
                                    case 'number':
                                        dataType = 'number';
                                        break;
                                    case 'text':
                                        dataType = 'string';
                                        if (
                                            (`${f.key}`.toLowerCase() === 'uid') ||
                                            `${f.key}`.toLowerCase().includes('nuid')
                                        ) dataType = 'uid';
                                        break;
                                    default:
                                        dataType = f.dataType;
                                }

                                if (f.type === 'dropdown') {
                                    const opts = (f.values || '').split('\n')
                                        .map((v = '') => v.trim())
                                        .filter((v: any) => v)
                                        .map((v: any) => {
                                            v = v.split(',');
                                            return { value: v[0] as string, label: v[1] as string, };
                                        });
                                    return opts.map(o => {
                                        return {
                                            label: f.label,
                                            key: f.key,
                                            type: f.type,
                                            dataType: 'dropdown',
                                            value: o.value,
                                            valueLabel: o.label,
                                        };
                                    });
                                }

                                return [{
                                    label: f.label,
                                    key: f.key,
                                    type: f.type,
                                    dataType,
                                    value: null,
                                    valueLabel: null,
                                }];
                            });
                            fields = formFields.reduce((acc, f) => {
                                return [...acc, ...f];
                            }, [] as typeof fields);
                            break;

                        case 'multi_select':
                            fields = items.map(item => ({
                                label: item.label,
                                key: item.id,
                                type: screen.type,
                                dataType: 'multi_select_option',
                                value: item.id,
                                valueLabel: item.label,
                            }));
                            break;
                        default: 
                            // do nothing
                    }

                    return {
                        screenId: screen.screenId,
                        type: screen.type,
                        title: screen.title,
                        ref: screen.refId,
                        fields,
                    };
                }),
            });
        });

        return { data, };
    } catch(e: any) {
        return { errors: [e.message], data: [], };
    }
}
