import 'dotenv/config';

import logger from '@/lib/logger';
import { confirmIfSeededSites, selectSite, seedUsers } from './functions';

async function main() {
    try {
        await confirmIfSeededSites();
        const site = await selectSite();
        await seedUsers(site);
    } catch(e: any) {
        logger.error('seed > main ERROR', e);
    } finally {
        process.exit();
    }
}

main();
