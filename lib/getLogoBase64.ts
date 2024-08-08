'use server';

import fs from 'node:fs';
import path from 'node:path';
import logger from './logger';

export async function getLogoBase64(filename: string = 'logo.png') {
    try {
        // return await fs.promises.readFile(path.resolve(__dirname, '../public/images/logo.png'), { encoding: 'base64'});
        return toDataUri(path.resolve('public/images', filename));
    } catch(e) {
        logger.error('getLogoBase64 ERROR', __dirname, e);
        return '';
    }
}

function toDataUri(imgPath: string) {
    // Read data
    const bitmap = fs.readFileSync(imgPath);

    // convert binary data to base64 encoded string
    const base64Image = Buffer.from(bitmap).toString('base64');

    // Get image file extension
    const ext = imgPath.split('.').pop();

    // complete data URI
    const uri = `data:image/${ext};base64,${base64Image}`;

    return uri;
}
