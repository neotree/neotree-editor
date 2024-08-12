import 'dotenv/config';
import fs from 'node:fs';
import { mergeDeep } from '@/lib/merge-deep';

const json = require('./sync.json');

main();

function main() {
    let script = {};
    let screen = {};
    let diagnosis = {};
    let configKey = {};

    json.scripts.forEach((s: any, i: number) => {
        script = mergeDeep(script, { ...s, });
    });

    json.screens.forEach((s: any, i: number) => {
        screen = mergeDeep(screen, { ...s, });
    });

    json.diagnoses.forEach((s: any, i: number) => {
        diagnosis = mergeDeep(diagnosis, { ...s, });
    });

    json.configKeys.forEach((s: any, i: number) => {
        configKey = mergeDeep(configKey, { ...s, });
    });

    fs.writeFile(
        'scripts/mapped.json', 
        JSON.stringify({
            script,
            screen,
            diagnosis,
            configKey,
        }, null, 4), 
        e => {
            if (e) {
                console.log('Failed to write mapped.json', e.message);
            } else {
                console.log('mapped.json created successfully!');
            }
        }
    );
}
