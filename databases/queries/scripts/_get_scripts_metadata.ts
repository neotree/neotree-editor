import { and, inArray, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { scripts, screens, hospitals, scriptsDrafts } from "@/databases/pg/schema";
import { ScriptField, ScriptImage, ScriptItem } from "@/types";
import * as uuid from "uuid";

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
            condition?: typeof screens.$inferSelect['condition'];
            skipToCondition?: typeof screens.$inferSelect['skipToCondition'];
            skipToScreen?: {
                screenId: string;
                position: number | null;
            } | null;
            managementMetadata?: {
                actionText: string;
                contentText: string;
                infoText: string;
                title: string;
                title1: string;
                title2: string;
                title3: string;
                title4: string;
                text1: string;
                text2: string;
                text3: string;
                instructions: string;
                instructions2: string;
                instructions3: string;
                instructions4: string;
                notes: string;
                refKey: string;
                images: {
                    contentTextImage: null | ScriptImage;
                    image1: null | ScriptImage;
                    image2: null | ScriptImage;
                    image3: null | ScriptImage;
                };
            } | null;
            fields: {
                label: string;
                key: string;
                type: string;
                dataType: string | null;
                value: any;
                valueLabel: null | string;
                optional?: boolean;
                confidential: boolean;
                minValue?: string | number | null;
                maxValue?: string | number | null;
                condition?: string | null;
                disableOtherOptionsIfSelected?: boolean;
                forbidWith?: string[];
            }[];
        }[];
        diagnoses: {
            diagnosisId: string;
            name: string;
            key: string;
            severityOrder?: string | number | null;
            expression?: string | number | null;
            expressionMeaning?: string | null;
            description?: string | null;
            fields: {
                label: string;
                key: string;
                type: string;
                dataType: string | null;
                value: any;
                valueLabel: null | string;
                optional?: boolean;
                confidential: boolean;
                minValue?: string | number | null;
                maxValue?: string | number | null;
            }[];
        }[];
    }[],
    errors?: string[];
};

export async function _getScriptsMetadata(params?: GetScriptsMetadataParams): Promise<GetScriptsMetadataResponse> {
    try {
        const sanitizeImage = (image: unknown): null | ScriptImage => {
            if (!image || typeof image !== "object") return null;
            const img = image as ScriptImage;
            return {
                data: `${img.data || ""}`,
                fileId: img.fileId,
                filename: img.filename,
                size: img.size,
                contentType: img.contentType,
            };
        };

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
        const oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));

        if (oldScriptsIds.length) {
            const res = await db.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
                
            });

        }
        const newScriptIds = scriptsIds.filter(s=>uuid.validate(s))

        let whereScriptsIds = !newScriptIds.length ? undefined : inArray(scripts.scriptId, newScriptIds);
        const whereHospitalsIds = !hospitalsIds.length ? undefined : inArray(scripts.hospitalId, hospitalsIds);

        const unpublisedScriptsRes = await db.query.scriptsDrafts.findMany({
            where: and(
                whereHospitalsIds,
                !newScriptIds.length ? undefined : and(
                    inArray(scriptsDrafts.scriptDraftId, newScriptIds),
                    isNull(scriptsDrafts.scriptId),
                ),
            ),
            with: {
                screensDrafts: true,
                diagnosesDrafts: true,
            }
        });

        const publishedScriptsRes = !returnDraftsIfExist ? [] : await db.query.scripts.findMany({
            where: and(
                whereScriptsIds,
                whereHospitalsIds,
            ),
            with: {
                draft: !returnDraftsIfExist ? undefined : true,
                screens: {
                    where: isNull(screens.deletedAt),
                    with: {
                        draft: !returnDraftsIfExist ? undefined : true,
                    },
                },
                diagnoses: {
                    where: isNull(screens.deletedAt),
                    with: {
                        draft: !returnDraftsIfExist ? undefined : true,
                    },
                },
            },
        });

        const publishedScripts = publishedScriptsRes.map(s => ({
            ...s,
            ...(returnDraftsIfExist && s.draft ? s.draft.data : null),
            screens: s.screens
                .sort((a, b) => a.position - b.position),
            diagnoses: s.diagnoses
                .sort((a, b) => a.position - b.position),
        }));

        const unpublisedScripts = unpublisedScriptsRes.map(s => {
            return {
                ...s.data,
                scriptId: s.scriptDraftId,
                screens: s.screensDrafts.map(screenDraft => ({
                    ...screenDraft.data,
                    screenId: screenDraft.screenDraftId,
                })),
                diagnoses: s.diagnosesDrafts.map(diagnosisDraft => ({
                    ...diagnosisDraft.data,
                    diagnosisId: diagnosisDraft.diagnosisDraftId,
                }))
            }
        }) as typeof publishedScripts;

        const scriptsFound = [
            ...publishedScripts,
            ...unpublisedScripts,
        ]
            .sort((a, b) => a.position - b.position);

        const data: GetScriptsMetadataResponse['data'] = [];

        scriptsFound.forEach(script => {
            const hospital = hospitalsArr.filter(h => h.hospitalId === script.hospitalId)[0];

            data.push({
                scriptId: script.scriptId,
                title: script.title,
                hospitalName: hospital?.name || '',
                diagnoses: script.diagnoses.map(d => {
                    return {
                        diagnosisId: d.diagnosisId,
                        name: d.name,
                        key: d.key || d.name,
                        severityOrder: d.severityOrder || '',
                        expression: d.expression || '',
                        expressionMeaning: d.expressionMeaning || '',
                        description: d.description || '',
                        fields: [],
                    };
                }),
                screens: script.screens.map(screen => {
                    const items = screen.items as ScriptItem[];
                    const screenFields = screen.fields as ScriptField[];
                    const skipToScreen = !screen.skipToScreenId
                        ? null
                        : (() => {
                            const targetScreen = script.screens.find(s => s.screenId === screen.skipToScreenId);
                            const targetScreenIndex = script.screens.findIndex(s => s.screenId === screen.skipToScreenId);
                            if (!targetScreen) {
                                return {
                                    screenId: screen.skipToScreenId,
                                    position: null,
                                };
                            }
                            return {
                                screenId: targetScreen.screenId,
                                position: targetScreenIndex >= 0 ? targetScreenIndex + 1 : null,
                            };
                        })();
                    const managementMetadata = screen.type !== 'management' ? null : {
                        actionText: `${screen.actionText || ''}`,
                        contentText: `${screen.contentText || ''}`,
                        infoText: `${screen.infoText || ''}`,
                        title: `${screen.title || ''}`,
                        title1: `${screen.title1 || ''}`,
                        title2: `${screen.title2 || ''}`,
                        title3: `${screen.title3 || ''}`,
                        title4: `${screen.title4 || ''}`,
                        text1: `${screen.text1 || ''}`,
                        text2: `${screen.text2 || ''}`,
                        text3: `${screen.text3 || ''}`,
                        instructions: `${screen.instructions || ''}`,
                        instructions2: `${screen.instructions2 || ''}`,
                        instructions3: `${screen.instructions3 || ''}`,
                        instructions4: `${screen.instructions4 || ''}`,
                        notes: `${screen.notes || ''}`,
                        refKey: `${screen.refKey || ''}`,
                        images: {
                            contentTextImage: sanitizeImage(screen.contentTextImage),
                            image1: sanitizeImage(screen.image1),
                            image2: sanitizeImage(screen.image2),
                            image3: sanitizeImage(screen.image3),
                        },
                    };

                    let fields: (GetScriptsMetadataResponse['data'][0]['screens'][0]['fields'][0])[] = [{
                        label: screen.label,
                        key: screen.key,
                        type: screen.type,
                        ...(() => {
                            switch (screen.type) {
                                default:

                                    // console.log("SCREEN", screen);

                                    return {
                                        dataType: screen.dataType,
                                        value: null,
                                        valueLabel: null,
                                        optional: screen.skippable,
                                        confidential: screen.confidential,
                                        minValue: screen.minValue,
                                        maxValue: screen.maxValue,
                                    };
                            }
                        })(),
                    }];

                    switch (screen.type) {
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
                                    optional: screen.skippable,
                                    confidential: screen.confidential,
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
                                optional: screen.skippable,
                                confidential: screen.confidential,
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
                                optional: screen.skippable,
                                confidential: screen.confidential,
                            }));
                            break;

                        case 'form':
                            const formFields = screenFields.map(f => {
                                let dataType = f.dataType;
                                const dropdownItems = f.items || [];

                                switch (f.type) {
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
                                    case 'multi_select':
                                        dataType = 'multi_select';
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

                                if (['multi_select', 'dropdown'].includes(f.type)) {
                                    let dataType = 'dropdown';
                                    if (f.type === 'multi_select') dataType = 'multi_select';

                                    let opts: {
                                        value: string;
                                        label: string;
                                        disableOtherOptionsIfSelected?: boolean;
                                        forbidWith?: string[];
                                    }[] = (f.values || '').split('\n')
                                        .map((v = '') => v.trim())
                                        .filter((v: any) => v)
                                        .map((v: any) => {
                                            v = v.split(',');
                                            return { value: v[0] as string, label: v[1] as string, };
                                        });
                                    
                                    if (dropdownItems.length) {
                                        opts = dropdownItems.map(o => ({
                                            value: `${o.value || ''}`,
                                            label: `${o.label || ''}`,
                                            disableOtherOptionsIfSelected: !!o.exclusive,
                                            forbidWith: (o.forbidWith || [])
                                                .map(forbidWithItemId =>
                                                    dropdownItems.find(item => item.itemId === forbidWithItemId)?.value
                                                )
                                                .filter((v): v is string | number => !!v)
                                                .map(v => `${v}`),
                                        }));
                                    }

                                    return opts.map(o => {
                                        return {
                                            label: f.label,
                                            key: f.key,
                                            type: f.type,
                                            dataType,
                                            value: o.value,
                                            valueLabel: o.label,
                                            optional: f.optional,
                                            confidential: f.confidential,
                                            disableOtherOptionsIfSelected: dataType === 'multi_select' ? !!o.disableOtherOptionsIfSelected : undefined,
                                            forbidWith: dataType === 'multi_select' ? (o.forbidWith || []) : undefined,
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
                                    optional: f.optional,
                                    confidential: f.confidential,
                                    minValue: f.minValue ?? f.minDate ?? f.minTime,
                                    maxValue: f.maxValue ?? f.maxDate ?? f.maxTime,
                                    condition: f.condition || '',
                                }];
                            });
                            fields = formFields.reduce((acc, f) => {
                                return [...acc, ...f];
                            }, [] as typeof fields);
                            break;

                        case 'single_select':
                            fields = items.map(item => ({
                                label: screen.label,
                                key: screen.key,
                                type: screen.type,
                                dataType: 'single_select_option',
                                value: item.id,
                                valueLabel: item.label,
                                optional: screen.skippable,
                                confidential: screen.confidential,
                            }));
                            break;

                        case 'multi_select':
                            fields = items.map(item => ({
                                label: screen.label,
                                key: screen.key,
                                type: screen.type,
                                dataType: 'multi_select_option',
                                value: item.id,
                                valueLabel: item.label,
                                optional: screen.skippable,
                                confidential: screen.confidential,
                                disableOtherOptionsIfSelected: !!item.exclusive,
                                forbidWith: (item.forbidWith || [])
                                    .map(forbidWithItemId => items.find(option => option.itemId === forbidWithItemId)?.id)
                                    .filter((v): v is string => !!v),
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
                        condition: screen.condition,
                        skipToCondition: screen.skipToCondition,
                        skipToScreen,
                        managementMetadata,
                        fields,
                    };
                }),
            });
        });

        return { data, };
    } catch (e: any) {
        return { errors: [e.message], data: [], };
    }
}
