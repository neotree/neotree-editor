import 'dotenv/config';
import readline from 'readline';

import { _searchUsers, _getUsers } from '@/databases/queries/users';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', function () {
    console.log('\nBYE BYE !!!');
    process.exit(0);
});

async function search(searchValue: string) {
    try {
        console.log(`Searching (${searchValue})...`);
        // const res = await _searchUsers(searchValue);
        if (searchValue) {
            const res = await _getUsers({ limit: 5, searchValue, status: 'active', });
            console.log('Results: ', res);
        }
        console.log('Results: ', []);
    } catch(e) {
        console.log(`Failed to search (${searchValue}): `, e);
    }
}

function main() {
    rl.question('Enter search value > ', function (searchValue) {
        if (searchValue === '/\q') {
            rl.close();
        } else {
            search(searchValue).finally(main);
        }
    });
}

main();
