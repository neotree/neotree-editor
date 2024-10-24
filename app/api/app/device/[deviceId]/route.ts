import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getDatesWhenUpdatesWereMade } from "@/databases/queries/ops";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _getConfigKeys, GetConfigKeysResults } from '@/databases/queries/config-keys';
import { _getDevice } from "@/databases/queries/devices";
import { _saveDevices } from "@/databases/mutations/devices";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { getHeaders } from "@/lib/header";

interface IParams {
    params: {
        deviceId: string;
    };
}

type ReqBody = {
    lastSyncDate?: string | null;
    dataVersion?: number | null;
    forceSync?: boolean;
    sessionsCount?: number;
    hospitalId?: string;
};

const data = {
    newData: false,
    deviceId: '',
    deviceHash: '',
    deviceScriptsCount: 0,
    dataVersion: 0,
    lastPublishDate: null! as Date,
    latestChangesDate: null! as Date,
    scripts: [] as Awaited<ReturnType<typeof getScriptsWithItems>>['data'],
    configKeys: [] as GetConfigKeysResults['data'],
};

export async function POST(req: NextRequest, { params: { deviceId } }: IParams) {
    const responseData = { ...data, deviceId, };

	try {
        logger.log(`[POST] /api/app/device/${deviceId}`);
        
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], data: responseData, });

        const { bearerToken } = getHeaders();

        let isLoggedIn = false;
        if (bearerToken) {
            const authenticated = await new Promise<null | { email: string; userId: string; }>((resolve, reject) => {
                jwt.verify(bearerToken, process.env.JWT_SECRET || '', (e, data) => {
                    if (e) {
                        reject(e);
                    } else if (data) {
                        const info = data as jwt.JwtPayload;
                        resolve({
                            email: info.email as string,
                            userId: info.userId as string,
                        });
                    } else {
                        resolve(null);
                    }
                });
            });
            isLoggedIn = !!authenticated;
        }

        const {
            lastSyncDate,
            dataVersion,
            forceSync,
            hospitalId,
            sessionsCount,
        }: ReqBody = await req.json();

        const deviceRes = await _getDevice({ deviceId, });

        if (deviceRes?.errors?.length) return NextResponse.json({ errors: deviceRes.errors, data: responseData, });

        let device = deviceRes.data;

        if (!device) {
            const res = await _saveDevices({
                returnSaved: true,
                data: [{ 
                    deviceId,
                    details: { scripts_count: 0, },
                }],
            });
            device = res.inserted[0];
        }

        responseData.deviceHash = device?.deviceHash || '';
        responseData.deviceScriptsCount = device?.details?.scripts_count;

        const editorInfoRes = await _getEditorInfo();
        const editorInfo = { ...editorInfoRes.data };

        if (editorInfoRes?.errors?.length) return NextResponse.json({ errors: editorInfoRes.errors, data: responseData, });

        responseData.lastPublishDate = editorInfo.lastPublishDate!;
        responseData.dataVersion = editorInfo.dataVersion!;

        const changesDates = await _getDatesWhenUpdatesWereMade();

        if (changesDates?.errors?.length) return NextResponse.json({ errors: changesDates.errors, data: responseData, });

        const latestChangesDate = changesDates.data.latestChangesDate;
        const appLastSyncDate = lastSyncDate ? new Date(lastSyncDate) : null;

        responseData.latestChangesDate = latestChangesDate!;

        const shouldFetchData = !!hospitalId && isLoggedIn && (
            forceSync ||
            !lastSyncDate ||
            (`${editorInfo.dataVersion}` !== `${dataVersion}`) ||
            (latestChangesDate && appLastSyncDate && (latestChangesDate.getTime() > appLastSyncDate.getTime()))
        );

        if (shouldFetchData) {
            const configKeys = await _getConfigKeys({ returnDraftsIfExist: true, });
            const scripts = await getScriptsWithItems({ hospitalIds: [hospitalId!], returnDraftsIfExist: true, });

            responseData.configKeys = configKeys.data;
            responseData.scripts = scripts.data;
            responseData.newData = true;
        }

        return NextResponse.json({
            data: responseData,
        });
	} catch(e: any) {
		logger.error(`[POST_ERROR] /api/app/device/${deviceId}`, e.message);
		return NextResponse.json({ errors: ['Internal Error'], responseData });
	}
}
