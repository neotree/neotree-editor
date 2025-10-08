import readline from "node:readline";
import { and, eq, } from "drizzle-orm";
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
import { parseImportedDataKeys, scrapDataKeys } from "@/lib/data-keys";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        let importedDataKeys: Awaited<ReturnType<typeof _getDataKeys>>['data'] = [];
        let scrappedDataKeys: Awaited<ReturnType<typeof scrapDataKeys>> = [];

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

            const { data: importedDataKeysRes } = await axiosClient.get<Awaited<ReturnType<typeof _getDataKeys>>>('/api/data-keys');

            importedDataKeys = importedDataKeysRes.data;

            res.data.data.forEach(s => {
                screens = [...screens, ...s.screens];
                diagnoses = [...diagnoses, ...s.diagnoses];
                drugsLibrary = [...drugsLibrary, ...s.drugsLibrary];
                scrappedDataKeys = [...scrappedDataKeys, ...s.dataKeys];
            });
        }

        const {
            dataKeys: parsedImportedDataKeys,
        } = await parseImportedDataKeys({
            importedDataKeys,
            importedScrappedKeys: scrappedDataKeys,
        });

        console.log({
            'importedDataKeys.length': importedDataKeys.length,
            'parsedImportedDataKeys.length': parsedImportedDataKeys.length,
            'parsedImportedDataKeys.filter(k => !k.id).length': parsedImportedDataKeys.filter(k => !k.id).length,
            'parsedImportedDataKeys.filter(k => k.isDifferentFromLocal).length': parsedImportedDataKeys.filter(k => k.isDifferentFromLocal).length,
            'parsedImportedDataKeys.filter(k => k.canSave).length': parsedImportedDataKeys.filter(k => k.canSave).length,
        });

        await writeFile(path.resolve(__dirname, 'keys.json'), JSON.stringify(parsedImportedDataKeys.filter(k => k.isDifferentFromLocal), null, 4));
    } catch(e: any) {
        console.error(e.message);
    } finally {
        process.exit(1);
    }
}
