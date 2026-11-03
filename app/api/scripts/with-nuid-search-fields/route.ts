import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScripts, saveScripts, } from "@/app/actions/scripts";
import { getDataKeys } from "@/app/actions/data-keys";

export async function GET(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const scriptsIdsJSON = req.nextUrl.searchParams.get('scriptsIds');
        const alignDataKeysSearchParam = req.nextUrl.searchParams.get('alignDataKeys');
        const scriptsIds = !scriptsIdsJSON ? undefined : JSON.parse(scriptsIdsJSON);

		const dataJSON = JSON.parse(req.nextUrl.searchParams.get('data') || '{}');

        let res = await getScripts({ 
			...dataJSON, 
			scriptsIds: scriptsIds || dataJSON.scriptsIds, 
		});

        res.data = res.data.filter(s => s.nuidSearchFields.length);

        const keyIds: string[] = []
        
        res.data.forEach(s => {
            s.nuidSearchFields.forEach(f => {
                if (f.keyId && keyIds.indexOf(f.keyId) < 0) {
                    keyIds.push(f.keyId);
                }
            })
        });

        const alignDataKeys = dataJSON.alignDataKeys || alignDataKeysSearchParam === 'true';
        const dataToSave: typeof res.data = [];

        if (keyIds.length && alignDataKeys) {
            const aligned: typeof res.data[0]['nuidSearchFields'] = [];

            res = { ...res, aligned } as typeof res;

            const dataKeys = await getDataKeys({ uniqueKeys: keyIds, });

            res.data.forEach((s, i) => {
                let shouldSave = false;

                s.nuidSearchFields.forEach((f, j) => {
                    const dk = dataKeys.data.find(k => k.uniqueKey === f.keyId);
                    if (dk && dk.label !== f.label) {
                        shouldSave = true;
                        res.data[i].nuidSearchFields[j] = {
                            ...f,
                            key: dk.name,
                            label: dk.label,
                            aligned: true,
                        } as typeof f;
                        aligned.push({ ...f, dataKey: dk, } as typeof f);
                    }
                });

                if (shouldSave) dataToSave.push(res.data[i]);
            });
        }

        if (dataToSave.length) await saveScripts({ data: dataToSave, });

		return NextResponse.json(res, { status: 200, });
	} catch(e: any) {
		logger.error('[GET] /api/scripts/with-items', e.message);
		return NextResponse.json({ errors: ['Internal Error'], data: [], dataKeys: [], }, { status: 200, });
	}
}
