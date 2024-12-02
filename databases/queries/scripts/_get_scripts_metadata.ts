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
            type: typeof screens.$inferSelect['type'];
            title: string;
            ref: string;
            fields: {
                label: string;
                key: string;
                type: string;
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
                    .map(screen => ({
                        ...screen,
                        ...(returnDraftsIfExist && screen.draft ? screen.draft.data : null),
                    }))
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

                    let fields: GetScriptsMetadataResponse['data'][0]['screens'][0]['fields'] = [{
                        label: screen.label,
                        key: screen.key,
                        type: screen.type,
                    }];

                    switch(screen.type) {
                        case 'progress':
                        case 'edliz_summary_table':
                        case 'mwi_edliz_summary_table':
                        case 'zw_edliz_summary_table':
                        case 'management':
                            fields = [];
                            break;

                        case 'diagnosis':
                            fields = items.map(item => ({
                                label: item.label,
                                key: item.label,
                                type: screen.type,
                            }));
                            break;

                        case 'checklist':
                            fields = items.map(item => ({
                                label: item.label,
                                key: item.key,
                                type: screen.type,
                            }));
                            break;

                        case 'form':
                            fields = screenFields.map(f => {
                                if (f.type === 'dropdown') {
                                    const opts = (f.values || '').split('\n')
                                        .map((v = '') => v.trim())
                                        .filter((v: any) => v)
                                        .map((v: any) => {
                                            v = v.split(',');
                                            return { value: v[0], label: v[1], };
                                        });
                                }
                                return {
                                    label: f.label,
                                    key: f.key,
                                    type: f.type,
                                };
                            });
                            break;

                        case 'multi_select':
                            fields = items.map(item => ({
                                label: item.label,
                                key: item.id,
                                type: screen.type,
                            }));
                            break;
                        default: 
                            // do nothing
                    }

                    return {
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
