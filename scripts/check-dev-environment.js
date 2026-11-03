#!/usr/bin/env node
/*
 * Runs before `yarn dev` (via the "predev" script). Two reminders. In a terminal it then asks
 * "Continue?": Y starts the app; N waits while you fix things, then re-checks. Without a terminal
 * (CI, pm2) or with SKIP_DEV_CHECKS=1 it only prints and never blocks:
 *
 * 1. Packages: lists dependencies from package.json that are missing from node_modules, or installed
 *    at a version that no longer satisfies package.json, so they get installed even if the developer
 *    never opens the feature that uses them. Fix with `yarn install`.
 *
 * 2. Manual migrations: Lists the files in manual_migrations/ that this
 * developer has not yet acknowledged, as a green tree grouped by year > month, so they remember to
 * run them against their local database.
 *
 *   yarn migrations:ack    record every listed migration as applied on this machine
 *   yarn migrations:list   show all migrations, applied or not
 *
 * What this machine has applied is recorded in .migrations-tracker.json (gitignored, per developer).
 * The app generates it on first run if it doesn't exist, then it exists before every pull, so only
 * migrations that arrive afterwards (or that were edited after being applied) are reported. This script
 * never blocks startup and never touches the database.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'manual_migrations');
const stateFile = path.join(root, '.migrations-tracker.json');

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = s => c('32', s);
const boldGreen = s => c('1;32', s);
const dim = s => c('2', s);
const yellow = s => c('33', s);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function checksum(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, file))).digest('hex');
}

// Shape: { version: 1, createdAt, applied: { "<file>": { appliedAt, checksum } } }
function loadTracker() {
    try {
        const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (parsed && typeof parsed.applied === 'object' && !Array.isArray(parsed.applied)) return parsed;
    } catch {
        // missing or unreadable: treated as "no tracker"
    }
    return null;
}

function saveTracker(tracker) {
    fs.writeFileSync(stateFile, JSON.stringify(tracker, null, 2) + '\n');
}

function newTracker() {
    return { version: 1, createdAt: new Date().toISOString(), applied: {} };
}

function recordApplied(tracker, files) {
    const appliedAt = new Date().toISOString();
    for (const file of files) tracker.applied[file] = { appliedAt, checksum: checksum(file) };
    saveTracker(tracker);
}

// A migration counts as applied only if recorded AND unchanged since it was recorded.
function migrationStatus(tracker, file) {
    const entry = tracker && tracker.applied[file];
    if (!entry) return 'pending';
    return entry.checksum === checksum(file) ? 'applied' : 'modified';
}

function listMigrations() {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
}

function groupByYearMonth(files) {
    const tree = new Map();
    for (const file of files) {
        const m = file.match(/^(\d{4})-(\d{2})-\d{2}/);
        const year = m ? m[1] : 'Other';
        const month = m ? MONTHS[Number(m[2]) - 1] || m[2] : '';
        if (!tree.has(year)) tree.set(year, new Map());
        if (!tree.get(year).has(month)) tree.get(year).set(month, []);
        tree.get(year).get(month).push(file);
    }
    return tree;
}

function printTree(files, tracker) {
    const tree = groupByYearMonth(files);
    console.log(boldGreen('manual_migrations/'));

    const years = [...tree.keys()];
    years.forEach((year, yi) => {
        const lastYear = yi === years.length - 1;
        console.log(green(`${lastYear ? '└── ' : '├── '}${year}/`));

        const months = [...tree.get(year).entries()];
        months.forEach(([month, items], mi) => {
            const lastMonth = mi === months.length - 1;
            const yPad = lastYear ? '    ' : '│   ';
            console.log(green(`${yPad}${lastMonth ? '└── ' : '├── '}${month}/`));

            items.forEach((file, fi) => {
                const lastFile = fi === items.length - 1;
                const mPad = lastMonth ? '    ' : '│   ';
                const branch = `${yPad}${mPad}${lastFile ? '└── ' : '├── '}`;
                const status = migrationStatus(tracker, file);
                const label = status === 'applied' ? dim(`${file}  ✓ applied`)
                    : status === 'modified' ? `${green(file)}  ${yellow('(edited since you applied it)')}`
                    : green(file);
                console.log(`${green(branch)}${label}`);
            });
        });
    });
}

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function findProblemPackages() {
    const pkg = readJson(path.join(root, 'package.json'));
    if (!pkg) return [];

    let semver = null;
    try {
        semver = require('semver');
    } catch {
        // semver not installed: fall back to presence-only checks
    }

    const problems = [];
    for (const group of ['dependencies', 'devDependencies']) {
        for (const [name, range] of Object.entries(pkg[group] || {})) {
            const installed = readJson(path.join(root, 'node_modules', name, 'package.json'));

            if (!installed) {
                problems.push({ group, name, range, reason: 'not installed' });
            } else if (semver && semver.validRange(range) && installed.version && !semver.satisfies(installed.version, range)) {
                problems.push({ group, name, range, reason: `installed ${installed.version}` });
            }
        }
    }
    return problems;
}

function printPackageTree(problems) {
    console.log(boldGreen('package.json'));

    const groups = ['dependencies', 'devDependencies'].filter(g => problems.some(p => p.group === g));
    groups.forEach((group, gi) => {
        const lastGroup = gi === groups.length - 1;
        console.log(green(`${lastGroup ? '└── ' : '├── '}${group}/`));

        const items = problems.filter(p => p.group === group);
        items.forEach((p, i) => {
            const branch = `${lastGroup ? '    ' : '│   '}${i === items.length - 1 ? '└── ' : '├── '}`;
            console.log(`${green(branch + p.name + '@' + p.range)}  ${yellow(`(${p.reason})`)}`);
        });
    });
}

function reportPackages(problems) {
    const line = '─'.repeat(64);
    console.log('');
    console.log(green(line));
    console.log(boldGreen('  Packages to install on your local machine'));
    console.log(green(line));
    console.log('');
    console.log(`  ${problems.length} package${problems.length === 1 ? ' is' : 's are'} missing or out of date. Some features will fail`);
    console.log('  when opened until you install them:');
    console.log('');
    printPackageTree(problems);
    console.log('');
    console.log(`  Please run ${yellow('yarn install')} before starting.`);
    console.log(green(line));
    console.log('');
}

function reportMigrations(pending, tracker) {
    const line = '─'.repeat(64);
    console.log('');
    console.log(green(line));
    console.log(boldGreen('  Database migrations to run on your local machine'));
    console.log(green(line));
    console.log('');
    console.log(`  Before starting, please run the following ${pending.length === 1 ? 'migration' : `${pending.length} migrations`}`);
    console.log('  against your local database (oldest first):');
    console.log('');
    printTree(pending, tracker);
    console.log('');
    console.log(`  e.g. ${dim('psql "$POSTGRES_DB_URL" -f manual_migrations/<file>.sql')}`);
    console.log(`  Already ran them? ${yellow('yarn migrations:ack')} records them as applied.`);
    console.log(green(line));
    console.log('');
}

const readline = require('node:readline');

function createPrompter() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let closed = false;
    rl.on('close', () => { closed = true; });

    return {
        // Resolves to null if stdin closes (e.g. EOF) so the caller can just continue.
        ask: question => new Promise(resolve => {
            if (closed) return resolve(null);
            rl.once('close', () => resolve(null));
            rl.question(question, answer => resolve(answer));
        }),
        close: () => rl.close(),
    };
}

// Prompts only when a human is at the terminal; piped/CI/pm2 runs just print and carry on.
const interactive = !!(process.stdin.isTTY && process.stdout.isTTY) && !process.env.SKIP_DEV_CHECKS;

// First run on this machine: generate the tracker. The developer tells us whether the migrations
// already in the folder have been run, so we never silently hide one that hasn't.
async function ensureTracker(all, prompter) {
    let tracker = loadTracker();
    if (tracker) return tracker;

    tracker = newTracker();
    saveTracker(tracker);
    console.log('');
    console.log(green(`  Created ${path.basename(stateFile)} (gitignored) to track the migrations you run locally.`));

    if (all.length && prompter) {
        console.log(`  Have you already run all ${all.length} migration${all.length === 1 ? '' : 's'} currently in manual_migrations/ on your local database?`);
        let answer;
        do {
            answer = await prompter.ask(`  ${boldGreen('Track them as applied?')} ${dim('(Y = already run them, N = list them as pending)')} [Y/n] `);
            if (answer === null) return tracker;
            answer = answer.trim().toLowerCase();
        } while (answer && !['y', 'yes', 'n', 'no'].includes(answer));

        if (!answer || answer.startsWith('y')) recordApplied(tracker, all);
    }
    // Non-interactive: leave the tracker empty so nothing is hidden from the developer.

    return tracker;
}

async function main() {
    const mode = process.argv[2];
    const all = listMigrations();

    if (mode === 'ack') {
        const tracker = loadTracker() || newTracker();
        const pending = all.filter(f => migrationStatus(tracker, f) !== 'applied');
        recordApplied(tracker, pending);
        console.log(boldGreen(`✔ Recorded ${pending.length} migration(s) as applied on this machine.`));
        return;
    }

    if (mode === 'list') {
        if (!all.length) return console.log('No manual migrations found.');
        printTree(all, loadTracker());
        return;
    }

    const prompter = interactive ? createPrompter() : null;

    try {
        const tracker = await ensureTracker(all, prompter);

        // Re-checks after every "fix then continue" so what is shown always reflects the current state.
        for (;;) {
            const problems = findProblemPackages();
            const pending = all.filter(f => migrationStatus(tracker, f) !== 'applied');

            if (!problems.length && !pending.length) return;

            if (problems.length) reportPackages(problems);
            if (pending.length) reportMigrations(pending, tracker);

            if (!prompter) return;

            let answer;
            do {
                answer = await prompter.ask(`  ${boldGreen('Continue?')} ${dim('(Y = Continue, N = Fix then continue)')} [Y/n] `);
                if (answer === null) return;
                answer = answer.trim().toLowerCase();
            } while (answer && !['y', 'yes', 'n', 'no'].includes(answer));

            if (!answer || answer.startsWith('y')) return;

            console.log('');
            console.log(`  Fix the items above (use another terminal), then press ${yellow('Enter')} to re-check.`);
            if (pending.length) console.log(dim('  Listed migrations will be recorded as applied once you continue.'));
            if ((await prompter.ask('  ')) === null) return;

            if (pending.length) recordApplied(tracker, pending);
        }
    } finally {
        if (prompter) prompter.close();
    }
}

main().catch(e => {
    // Never block the dev server over a reminder.
    console.warn('Could not run dev environment checks:', e.message);
});
