import 'dotenv/config';
import readline from 'readline';

import logger from "@/lib/logger";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', function () {
    console.log('\nBYE BYE !!!');
    process.exit(0);
});

async function log(text: string) {
    logger.error(text);
}

function main() {
    rl.question('Enter some text > ', function (searchValue) {
        if (searchValue === '/\q') {
            rl.close();
        } else {
            log(searchValue).finally(main);
        }
    });
}

main();
