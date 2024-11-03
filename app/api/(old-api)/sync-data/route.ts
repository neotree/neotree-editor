import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getScripts, _getScreens, _getDiagnoses, } from "@/databases/queries/scripts";
import { _getConfigKeys, } from "@/databases/queries/config-keys";
import { _getHospitals, } from "@/databases/queries/hospitals";
import { mapNewConfigKeysToOld, mapNewDiagnosisToOld, mapNewScreenToOld, mapNewScriptToOld } from '@/lib/map-old-and-new';
import { getDevice } from "../get-device-registration/get-device";
import { isValidUrl } from "@/lib/urls";

export async function GET(req: NextRequest) {
	try {
        logger.log(`[GET - start]: ${req.url}`);

        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const deviceId = req.nextUrl.searchParams.get('deviceId');
        const hospitalId = req.nextUrl.searchParams.get('hospitalId');

        const { device, info: webeditorInfo, errors } = await getDevice(deviceId!);

        if (errors) return NextResponse.json({ errors, });

        const withDeleted = false;
        const returnDraftsIfExist = true;

        const [
            hospitals,
            getScripts,
            getConfigKeys,
        ] = await Promise.all([
            _getHospitals(),
            _getScripts({ withDeleted, returnDraftsIfExist, hospitalIds: hospitalId ? [hospitalId] : undefined, }),
            _getConfigKeys({ withDeleted, returnDraftsIfExist, }),
        ]);

        const [
            getScreens,
            getDiagnoses,
        ] = await Promise.all([
            !getScripts.data.length ? { data: [], } : _getScreens({ withDeleted, returnDraftsIfExist, scriptsIds: getScripts.data.map(s => s.scriptId) }),
            !getScripts.data.length ? { data: [], } : _getDiagnoses({ withDeleted, returnDraftsIfExist, scriptsIds: getScripts.data.map(s => s.scriptId) }),
        ]);

        const getImageUrl = (suffix: string) => {
            let host = process.env.NEXT_PUBLIC_APP_URL || '';
            if (host.substring(host.length - 1, host.length) === '/') host = host.substring(0, host.length - 1);
            if (suffix[0] === '/') suffix = suffix.substring(1, suffix.length); 
            return [host, suffix].filter(s => s).join('/');
        };

        getScreens.data.forEach((d, j) => {
            if (d.image1?.data && d.image1?.fileId && !isValidUrl(d.image1.data)) {
                getScreens.data[j].image1!.data = getImageUrl(d.image1.data);
            }
            if (d.image2?.data && d.image2?.fileId && !isValidUrl(d.image2.data)) {
                getScreens.data[j].image2!.data = getImageUrl(d.image2.data);
            }
            if (d.image3?.data && d.image3?.fileId && !isValidUrl(d.image3.data)) {
                getScreens.data[j].image3!.data = getImageUrl(d.image3.data);
            }
        });

        getDiagnoses.data.forEach((d, j) => {
            if (d.image1?.data && d.image1?.fileId && !isValidUrl(d.image1.data)) {
                getDiagnoses.data[j].image1!.data = getImageUrl(d.image1.data);
            }
            if (d.image2?.data && d.image2?.fileId && !isValidUrl(d.image2.data)) {
                getDiagnoses.data[j].image2!.data = getImageUrl(d.image2.data);
            }
            if (d.image3?.data && d.image3?.fileId && !isValidUrl(d.image3.data)) {
                getDiagnoses.data[j].image3!.data = getImageUrl(d.image3.data);
            }
        });

        // config keys
        const configKeys = getConfigKeys.data.filter(s => !s.isDeleted).map(s => mapNewConfigKeysToOld(s));
        const deletedConfigKeys = getConfigKeys.data.filter(s => s.isDeleted).map(s => mapNewConfigKeysToOld(s));

        // scripts
        const scripts = getScripts.data.filter(s => !s.isDeleted).map(s => {
            const hospitalId = hospitals.data.filter(h => h.hospitalId === s.hospitalId)[0]?.oldHospitalId;
            return mapNewScriptToOld({ ...s, hospitalId: hospitalId || s.hospitalId, });
        });
        const deletedScripts = getScripts.data.filter(s => s.isDeleted).map(s => {
            const hospitalId = hospitals.data.filter(h => h.hospitalId === s.hospitalId)[0]?.oldHospitalId;
            return mapNewScriptToOld({ ...s, hospitalId: hospitalId || s.hospitalId, });
        });

        // screens
        const screens = getScreens.data.filter(s => !s.isDeleted).map(s => mapNewScreenToOld(s));
        const deletedScreens = getScreens.data.filter(s => s.isDeleted).map(s => mapNewScreenToOld(s));

        // diagnoses
        const diagnoses = getDiagnoses.data.filter(s => !s.isDeleted).map(s => mapNewDiagnosisToOld(s));
        const deletedDiagnoses = getDiagnoses.data.filter(s => s.isDeleted).map(s => mapNewDiagnosisToOld(s));

        logger.log(`[GET - finish]: ${req.url}`);

		return NextResponse.json({
            device,
            webeditorInfo,
            configKeys,
            deletedConfigKeys,
            deletedDiagnoses,
            deletedScreens,
            deletedScripts,
            diagnoses,
            screens,
            scripts,
        });
	} catch(e: any) {
		logger.error('[GET] /api/sync', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
