'use server';

import readline from 'node:readline';
import moment from 'moment';
import { createReadStream } from 'node:fs';

import logger from "@/lib/logger";

export async function getLogs({ date, type = 'logs', endDate }: {
    date: Date
    endDate?: null | Date,
    type?: 'errors' | 'logs' | 'app_errors',
}) {
    const response: {
        data: string[];
        errors?: string[];
    } = {
        data: [],
    };

    try {
        if (!date) throw new Error('Date not provided');

        endDate = endDate || date;
        const start = new Date(moment(date).format('YYYY-MM-DD'));
        const end = new Date(moment(endDate).format('YYYY-MM-DD'));

        const files: string[] = [];

        let _date = moment(start).subtract(1, 'day').toDate();
        while(_date < end) {
            _date = moment(_date).add(1, 'day').toDate();
            files.push(['logs', moment(_date).format('YYYYMMDD'), `${type}.txt`].join('/'));
        }

        for (const filename of files) {
            await new Promise<boolean>(resolve => {
                (async () => {
                    const fileStream = createReadStream(filename);

                    const rl = readline.createInterface({
                        input: fileStream,
                        crlfDelay: Infinity
                    });

                    try {
                        for await (const line of rl) response.data.push(line);
                    } catch(e) { /**/ }
                    
                    resolve(true);
                })();
            });
        }

        response.data = response.data.reverse();
    } catch(e: any) {
        logger.error('getLogs ERROR', e.message);
        response.errors = [e.message];
    } finally {
        return response;
    }
}
