import 'dotenv/config';
import { eq } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import logger from '@/lib/logger';

import { isEmpty } from '@/lib/isEmpty';
import { rl } from './rl';

export * from './axios';
export * from './rl';
export * from './files';
export * from './scripts';
export * from './users';

export function confirmIfShouldSeedFiles(): Promise<boolean> {
    return new Promise((resolve) => {
        console.log('> Do you want to seed files?');
        rl.question(
            `${['[1] Yes', '[2] No'].join('\n')}\n> `, 
            function (value) {
                const index = Number(value);
                if (index === 2) {
                    resolve(false);
                } else if (index === 1) {
                    resolve(true);
                } else {
                    console.log('Invalid input, try again!');
                    confirmIfShouldSeedFiles();
                }
            }
        );
    });
}

export function confirmIfShouldSeedUsers(): Promise<boolean> {
    return new Promise((resolve) => {
        console.log('> Do you want to seed users?');
        rl.question(
            `${['[1] Yes', '[2] No'].join('\n')}\n> `, 
            function (value) {
                const index = Number(value);
                if (index === 2) {
                    resolve(false);
                } else if (index === 1) {
                    resolve(true);
                } else {
                    console.log('Invalid input, try again!');
                    confirmIfShouldSeedUsers();
                }
            }
        );
    });
}

export function confirmIfSeededSites(): Promise<boolean> {
    return new Promise((resolve) => {
        console.log('> You must seed sites first and populate the api_keys');
        rl.question(
            `${['[1] Done', '[2] Not yet'].join('\n')}\n> `, 
            function (value) {
                const index = Number(value);
                if (index === 2) {
                    console.log('> Run yarn tsx scripts/seed/sites.ts');
                    process.exit();
                } else if (index === 1) {
                    resolve(true);
                } else {
                    console.log('Invalid input, try again!');
                    confirmIfSeededSites();
                }
            }
        );
    });
}

export function selectSite(): Promise<typeof schema.sites.$inferSelect> {
    return new Promise(resolve => {
        (async () => {
            // get sites
            console.log('> loading sites');
            const sites = await db.query.sites.findMany({
                where: eq(schema.sites.type, 'webeditor'),
            });

            rl.question(
                `${sites.map(({ name }, i) => [`[${i + 1}]`, name].join(' ')).join('\n')}\n> `, 
                function (value) {
                    const index = Number(value);
                    const site = isNaN(index) || isEmpty(value) ? null : sites[index - 1];

                    if (!site) {
                        console.log('Invalid input, try again!');
                        selectSite();
                    } else {
                        console.log(`> seeding ${site.name}`);
                        resolve(site);
                    }
                }
            );
        })();
    })
}


export async function seedSites() {
    try {
        // clear the table
        console.log('> clear sites table');
        await db.delete(schema.sites);

        // insert data
        console.log('> insert sites');
        await db.insert(schema.sites).values([
            {
                name: 'Demo WebEditor',
                type: 'webeditor',
                link: 'https://demo-webeditor.neotree.org',
                apiKey: '',
            },
            {
                name: 'Demo NodeApi',
                type: 'nodeapi',
                link: 'https://demo-nodeapi.neotree.org',
                apiKey: '',
            },
            {
                name: 'Malawi WebEditor',
                type: 'webeditor',
                link: 'https://webeditor.neotree.org',
                apiKey: '',
            },
            {
                name: 'Malawi NodeApi',
                type: 'nodeapi',
                link: 'https://nodeapi.neotree.org',
                apiKey: '',
            },
            {
                name: 'Malawi WebEditor DEV',
                type: 'webeditor',
                link: 'https://webeditor-dev.neotree.org',
                apiKey: '',
            },
            {
                name: 'Malawi NodeApi DEV',
                type: 'nodeapi',
                link: 'https://nodeapi-dev.neotree.org',
                apiKey: '',
            },
            {
                name: 'Zimbabwe WebEditor',
                type: 'webeditor',
                link: 'https://zim-webeditor.neotree.org:10243',
                apiKey: '',
            },
            {
                name: 'Zimbabwe NodeApi',
                type: 'nodeapi',
                link: 'http://zim-nodeapi.neotree.org',
                apiKey: '',
            },
            {
                name: 'Zimbabwe WebEditor DEV',
                type: 'webeditor',
                link: 'https://zim-dev-webeditor.neotree.org:10243',
                apiKey: '',
            },
            {
                name: 'Zimbabwe NodeApi DEV',
                type: 'nodeapi',
                link: 'http://zim-dev-nodeapi.neotree.org',
                apiKey: '',
            },
        ]);

        console.log('> sites inserted successfully!');
    } catch(e: any) {
        logger.error('seedSites ERROR', e);
    } finally {
        process.exit();
    }
}
