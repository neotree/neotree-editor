import '@/server/env';
import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import { _getScreens } from '@/databases/queries/scripts';
import { getScriptsWithItems } from "@/app/actions/scripts";
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _saveDiagnoses, _saveScreens, } from "@/databases/mutations/scripts";
import { _saveDataKeys, } from '@/databases/mutations/data-keys';
import { inArray } from 'drizzle-orm';

main();

async function main() {
    try {
        const dataKeys = await _getDataKeys({
            keys: [{ label: 'No', name: 'No', dataType: 'single_select_option', }],
        });

        console.log('dataKeys', dataKeys.data);
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
