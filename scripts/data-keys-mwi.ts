import '@/server/env';
import { _remoteExtractDataKeys } from "@/databases/mutations/data-keys";

main();

async function main() {
    try {
        const res = await _remoteExtractDataKeys({ country: 'mwi', });
        console.log('SUCCESS');
        console.log(res);
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
