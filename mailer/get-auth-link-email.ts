export function getAuthLinkEmail({ token, name }: {
    token: number;
    name: string;
}) {
    const message = `Use this link, to sign into your account:`;
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/authorize/${token}`;
    return {
        subject: 'Sign in link',
        textMessage: [
            `Hi ${name},\n`, 
            message + '\n',
            link,
            'Note that this link expires in 1 hour and can only be used once.',
            'If you haven&apos;t requested this email, there&apos;s nothing to worry about - you can safely ignore it.',
        ].join('\n'),
        htmlMessage: `
            <p class="text-lg font-bold">Hi ${name}</p>
            <p>${message}</p>
            <div class="my-md text-center text-lg font-bold">
                <a href="${link}">Activate account</a>
            </div>
            <p>Note that this link expires in 1 hour and can only be used once.</p>
            <p>If you haven&apos;t requested this email, there&apos;s nothing to worry about - you can safely ignore it.</p>
        `,
    };
}
