import 'dotenv/config';

import * as schema from '@/databases/pg/schema';
import logger from '@/lib/logger';
import { 
    confirmIfSeededSites, 
    selectSite, 
    confirmIfShouldSeedUsers, 
    confirmIfShouldSeedFiles,
    axiosClient, 
    seedScripts, 
    seedFiles, 
    seedUsers 
} from "./functions";

async function main() {
    try {
        await confirmIfSeededSites();
        const shouldSeedUsers = await confirmIfShouldSeedUsers();
        const shouldSeedFiles = await confirmIfShouldSeedFiles();
        const site = await selectSite();
        seed({ site, shouldSeedUsers, shouldSeedFiles, });
    } catch(e: any) {
        logger.error('seed > main ERROR', e);
        process.exit();
    }
}

async function seed({ site, shouldSeedUsers, shouldSeedFiles, }: {
    site: typeof schema.sites.$inferSelect;
    shouldSeedUsers: boolean;
    shouldSeedFiles: boolean;
}) {
    try {
        const axios = axiosClient(site);

        // seed users
        if (shouldSeedUsers) await seedUsers(site);

        // seed files
        if (shouldSeedFiles) await seedFiles(site);

        // seed scripts
        await seedScripts(site);
    } catch(e: any) {
        logger.error('seed ERROR', e);
    } finally {
        process.exit();
    }
}

main();
