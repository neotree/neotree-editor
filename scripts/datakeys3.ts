import readline from "node:readline";
import { and, eq, inArray, } from "drizzle-orm";
import queryString from "query-string";
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import '@/server/env';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { _getDiagnoses, _getScreens } from '@/databases/queries/scripts';
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _saveDiagnoses, _saveScreens, } from "@/databases/mutations/scripts";
import { _saveDataKeys, } from '@/databases/mutations/data-keys';
import { getScriptsWithItems } from "@/app/actions/scripts";
import { getSiteAxiosClient } from "@/lib/server/axios";
import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";
import { linkScrappedKeysToDataKeys, scrapDataKeys } from "@/lib/data-keys";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const scripts = {
    mwi: [
        'c04f628d-3d1a-46f1-8d9a-14c203a45463',
        'e6b6c37c-7583-440b-8f7e-eea62cd951df',
        '1a911540-24ad-4220-8745-1fdb83246427',
        '1a911540-24ad-4220-8745-1fdb83246427',
        '0dd4ab66-b693-49b1-8363-5a4d5beeee8c',
        'c06d63a4-0da4-463e-9024-422a10a5d19b',
        '2173593d-8ac3-4c67-a880-8390728279bb',
        '0acf7627-ef74-4dc0-8c74-f51fc5b9a4ad',
    ],
    zw: [
        'c021e05a-a562-48b0-b495-34529ee51d0a',
        '3b953d22-8a46-45bc-8234-9521334221a3',
        '21940a83-8d97-41d1-a0ec-5dad7fb2f3db',
        '7c4f5b8f-ed1f-4e6e-8bce-bf3978e410a6',
        'fea2c220-f9dc-4363-a35f-13b2b4bfed26',
        'afa5984e-c07d-4025-8150-de25bb37144a',
        '0cbb1921-c1b3-4a4c-a516-45397e01a801',
        '488c51f9-9f75-4dcf-a527-aed0ae16e9b6',
        'e06666f2-2147-4391-86a2-160d86d3b72b',
        '910a2d2f-df69-4917-b0cf-d275d511bb3e',
        '678cbcfd-37df-42c3-96bf-c290dfa3ec69',
        '5e72aa19-79d3-4676-9435-c5759d762e5a',
        '7ff273e5-b9b5-4a8f-9df9-d198bf0af13b',
        '9dabc437-635e-431f-bded-6eee128e0249',
        '5bb6430c-eb0e-4afe-a44d-1aae3b00f7b3',
    ],
    demo: [],
};

main();

function askQuestion<T = string>(question: string) {
    return new Promise<T>((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer as T);
        });
    });
}

async function main() {
    try {
        const country = await askQuestion('Country (zw or mwi or demo):\n> ');
        const env = await askQuestion('Env (production or stage or development or demo):\n> ');
        const scriptsIds = await askQuestion('Scripts IDs (comma-separated uuids):\n> ');

        let screens: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['screens'] = [];
        let diagnoses: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['diagnoses'] = [];
        let drugsLibrary: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0]['drugsLibrary'] = [];

        console.log(`Fetching ${country} sites`);
        const sites = await db.query.sites.findMany({
            where: and(
                eq(schema.sites.countryISO, country),
                eq(schema.sites.env, env as typeof schema.sites.$inferSelect['env']),
                eq(schema.sites.type, 'webeditor'),
            ),
        });

        console.log(`Found ${sites.length} sites. Fetching data...`);

        for (const site of sites) {
            // if (site.link === 'https://zim-webeditor.neotree.org:10243') continue;

            const axiosClient = await getSiteAxiosClient(site.siteId);

            const res = await axiosClient.get<Awaited<ReturnType<typeof getScriptsWithItems>>>('/api/scripts/with-items?' + queryString.stringify({
                scriptsIds: !scriptsIds ? undefined : JSON.stringify(scriptsIds.split(',')),
            }));

            res.data.data.forEach(s => {
                screens = [...screens, ...s.screens];
                diagnoses = [...diagnoses, ...s.diagnoses];
                drugsLibrary = [...drugsLibrary, ...s.drugsLibrary];
            });
        }

        let {
            allKeys: scrappedDataKeys,
            screens: screensKeys,
            diagnoses: diagnosesKeys,
        } = await scrapDataKeys({
            withoutUniqueKeys: true,
            screens,
            diagnoses,
            drugsLibrary,
        });

        const { data: dataKeys, } = !scrappedDataKeys.length ? { data: [], } : await _getDataKeys({
            keys: scrappedDataKeys,
        });

        screensKeys = linkScrappedKeysToDataKeys(dataKeys, screensKeys);
        diagnosesKeys = linkScrappedKeysToDataKeys(dataKeys, diagnosesKeys);

        console.log('scrappedDataKeys.length', scrappedDataKeys.length);
        console.log('dataKeys.length', dataKeys.length);
        await writeFile(path.resolve(__dirname, 'keys.json'), JSON.stringify(scrappedDataKeys, null, 4));
    } catch(e: any) {
        console.error(e.message);
    } finally {
        process.exit(1);
    }
}
