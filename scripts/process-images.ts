import fs from 'node:fs';
import { AxiosInstance } from 'axios';

import '@/server/env';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { getSiteAxiosClient } from '@/lib/axios';
import { _getDiagnoses, _getScreens } from '@/databases/queries/scripts';
import { eq } from 'drizzle-orm';
import { ScriptImage } from '@/types';
import { isValidUrl } from '@/lib/urls';
import { UploadFileFromSiteResponse } from '@/app/actions/files';

main();

async function main() {
    try {
        const sitesRes = await db.query.sites.findMany({
            where: eq(schema.sites.type, 'webeditor'),
        });

        const sites = await Promise.all(sitesRes.map(site => new Promise<typeof sitesRes[0] & { axios: AxiosInstance; }>((resolve) => {
            (async () => {
                const axios = await getSiteAxiosClient({
                    baseURL: site.link,
                    apiKey: site.apiKey,
                });
                resolve({
                    ...site,
                    axios,
                });
            })();
        })));

        for (const { axios, ...site } of sites) {            
            console.log(`SITE <${site.name}>`);

            const log: typeof console.log = (...args) => {
                console.log(`SITE <${site.name}>`, ...args);
                // fs.appendFileSync('./logs.txt', JSON.stringify(args));
            };

            const screensRes = await axios.get<Awaited<ReturnType<typeof _getScreens>>>('/api/screens/with-images');
            const { data: screens } = screensRes.data;

            const diagnosesRes = await axios.get<Awaited<ReturnType<typeof _getDiagnoses>>>('/api/diagnoses/with-images');
            const { data: diagnoses } = diagnosesRes.data;

            log(`Found ${screens.length} screens with images`);
            log(`Found ${diagnoses.length} diagnoses with images`);

            let screenIndex = 0;
            let diagnosisIndex = 0;

            const processImage = async (img: ScriptImage) => {
                let siteURL = img.data.split('/').filter((_, i) => i < 3).join('/');
                let _errors: string[] = [];
                let updated = false;

                if ((siteURL !== site.link) && isValidUrl(siteURL) && img.fileId) {
                    const res = await axios.post<UploadFileFromSiteResponse>('/api/files/upload/from-site', {
                        siteURL,
                        fileId: img.fileId,
                    });

                    const { errors, data } = res.data;

                    if (errors?.length) {
                        log(img.data);
                        log(siteURL + '/api/files/upload/from-site ERRORS', errors);
                        _errors = errors;
                    }

                    if (data) {
                        img.data = data.fileURL;
                        updated = true;
                    }
                }
                return { image: img, updated, errors: _errors };
            };

            for (let screen of screens) {
                log(`SCREEN ${screenIndex + 1} / ${screens.length}`);

                let updated = false;

                const logScreenInfo = () => {
                    const data = [site.link, 'script', screen.scriptId, 'screen', screen.screenId].join('/');
                    log('screen', data);
                    fs.appendFileSync('./logs.txt', data);
                };

                if (screen.image1) { 
                    const res = await processImage(screen.image1);
                    screen.image1 = res.image;
                    updated = res.updated;
                    if (res.errors?.length) logScreenInfo();
                }
                if (screen.image2) { 
                    const res = await processImage(screen.image2);
                    screen.image2 = res.image;
                    updated = res.updated;
                    if (res.errors?.length) logScreenInfo();
                }
                if (screen.image3) { 
                    const res = await processImage(screen.image3);
                    screen.image3 = res.image;
                    updated = res.updated;
                    if (res.errors?.length) logScreenInfo();
                }

                if (updated) {
                    const res = await axios.post(`/api/screens/save`, { data: [screen] });
                    log(res.data);
                }
                screenIndex++;
            }

            for (let diagnosis of diagnoses) {
                log(`DIAGNOSIS ${diagnosisIndex + 1} / ${diagnoses.length}`);

                let updated = false;

                const logScreenInfo = () => log('diagnosis', [site.link, 'script', diagnosis.scriptId, 'diagnosis', diagnosis.diagnosisId].join('/'));

                if (diagnosis.image1) { 
                    const res = await processImage(diagnosis.image1);
                    diagnosis.image1 = res.image;
                    updated = res.updated;
                    if (res.errors?.length) logScreenInfo();
                }
                if (diagnosis.image2) { 
                    const res = await processImage(diagnosis.image2);
                    diagnosis.image2 = res.image;
                    updated = res.updated;
                    if (res.errors?.length) logScreenInfo();
                }
                if (diagnosis.image3) { 
                    const res = await processImage(diagnosis.image3);
                    diagnosis.image3 = res.image;
                    updated = res.updated;
                    if (res.errors?.length) logScreenInfo();
                }

                if (updated) {
                    const res = await axios.post(`/api/diagnoses/save`, { data: [diagnosis] });
                    log(res.data);
                }
                diagnosisIndex++;
            }

            log('');
            log('   ***   ***   ***   ');
            log('');
        }
    } catch(e: any) {
        console.log(e);
    } finally {
        process.exit(1);
    }
}
