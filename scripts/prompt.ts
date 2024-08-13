import prompt from 'prompt';

prompt.start();

main();

async function main() {
    const { sitesSeeded } = await prompt.get({
        properties: {
            sitesSeeded: {
                description: 'Have you seeded the sites? y/n',
                message: 'Have you seeded the sites? y/n',
                required: true,
                default: 'y',
                pattern: /^[YyNn]$/,
                type: 'string',
                hidden: false, // for passwords
                // replace: '*',  // If `hidden` is set it will replace each hidden character with the specified string.
            },
        },
    });

    if (sitesSeeded === 'n') {
        console.log('you need to seed sites first, then continue...');
        return;
    }

    console.log('seeding...');
}
