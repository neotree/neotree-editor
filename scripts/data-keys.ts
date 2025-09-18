import '@/server/env';
import { _extractDataKeys } from "@/databases/mutations/data-keys";

main();

async function main() {
    try {
        const res = await _extractDataKeys();
        console.log('SUCCESS');
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
