import fs from 'node:fs';
import path from 'node:path';
import moment from 'moment';

function writeLogsToFile(filename: string, ...args: any[]) {
    const date = moment(new Date()).format('YYYYMMDD');
    const dir = path.resolve(`logs/${date}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const data = `${new Date().toUTCString()} ${JSON.stringify([...args])}\n`;
    const filePath = `${dir}/${filename}`;
    fs.appendFileSync(filePath, data);
}

const log: typeof console.log = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args, __filename);
    }
    //writeLogsToFile('logs.txt', ...args);
};

const error: typeof console.error = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(...args, __filename);
    }
    writeLogsToFile('errors.txt', ...args);
};

const appError: typeof console.error = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(...args, __filename);
    }
    writeLogsToFile('app_errors.txt', ...args);
};

const logger = {
    log,
    error,
    appError,
};

export default logger;
