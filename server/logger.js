// CommonJS counterpart of lib/logger.ts, for the server entry point.
//
// server/index.js is run directly by node before Next compiles anything, so it
// cannot require the TypeScript logger. Process lifecycle messages are also
// written to stdout/stderr unconditionally (unlike lib/logger.ts, which only
// echoes outside production) because pm2 captures those streams and they are
// how an operator sees that the server came up or failed to.

const fs = require('node:fs');
const path = require('node:path');

function writeLogsToFile(filename, args) {
    try {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const dir = path.resolve(`logs/${date}`);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(`${dir}/${filename}`, `${new Date().toUTCString()} ${JSON.stringify(args)}\n`);
    } catch (e) {
        // Logging must never take the server down.
        process.stderr.write(`logger write failed: ${e && e.message}\n`);
    }
}

function serialise(args) {
    return args.map(a => (a instanceof Error ? { message: a.message, stack: a.stack } : a));
}

const log = (...args) => {
    process.stdout.write(`${args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`);
    writeLogsToFile('logs.txt', serialise(args));
};

const error = (...args) => {
    process.stderr.write(`${args.map(a => (a instanceof Error ? a.stack || a.message : typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`);
    writeLogsToFile('errors.txt', serialise(args));
};

module.exports = { log, error };
