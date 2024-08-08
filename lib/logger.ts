import fs from 'node:fs';
import path from 'node:path';
import moment from 'moment';

function writeLogsToFile(type: 'error' | 'log', ...args: any[]) {
    const date = moment(new Date()).format('YYYYMMDD');
    const dir = path.resolve(`logs/${date}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const data = `${new Date().toUTCString()} ${JSON.stringify([...args, __filename])}\n`;
    let filename = `${dir}/logs.txt`;
    if (type === 'error') filename = `${dir}/errors.txt`; 
    fs.appendFileSync(filename, data);
}

const log: typeof console.log = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args, __filename);
    }
    writeLogsToFile('log', ...args);
};

const error: typeof console.error = (...args) => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            console.error(...args, __filename);
        }
        writeLogsToFile('error', ...args);
    } catch(e) {
        console.log(e);
        // do nothing
    }
};

const logger = {
    log,
    error,
};

export default logger;
