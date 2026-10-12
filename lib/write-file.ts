import fs from 'fs';

import logger from '@/lib/logger';

export function writeFile({
    path,
    data,
}: {
    path: string;
    data: string;
}): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(path, data, e => {
            if (e) {
                logger.error('writeFile ERROR', e.message);
                reject(e);
            } else {
                resolve(true);
            }
        });
    });
}
