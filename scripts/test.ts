import '../server/env';
import { _extractDataKeys } from '@/databases/mutations/data-keys';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

main();

async function main() {
    const res = await _extractDataKeys();
    await writeFile(path.resolve(__dirname, 'test.json'), JSON.stringify(res, null, 4));
}
