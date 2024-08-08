export function getUserDeletedEmail({ name }: {
    name: string;
}) {
    const message = `Your ${process.env.NEXT_PUBLIC_APP_NAME} account has been deleted.`;
    return {
        subject: ['Account deleted'].join(' '),
        textMessage: [
            `Hi ${name},\n`, 
            message + '\n',
        ].join('\n'),
        htmlMessage: `
            <p class="text-lg font-bold">Hi ${name}</p>
            <p>${message}</p>
        `,
    };
}
