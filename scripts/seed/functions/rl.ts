import 'dotenv/config';
import readline from 'readline';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', function () {
    console.log('\nBYE BYE !!!');
    process.exit(0);
});
