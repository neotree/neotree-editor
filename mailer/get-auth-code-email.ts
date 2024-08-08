export function getAuthCodeEmail({ token, name }: {
    token: number;
    name: string;
}) {
    const message = 'Here&apos;s your sign in verification code, enter it in your open browser window and we&apos;ll help you to sign in.';
    return {
        subject: ['Verification code', token].join(' '),
        textMessage: [
            `Hi ${name},\n`, 
            message + '\n',
            token,
            'Note that this code expires in 1 hour and can only be used once.',
            'If you haven&apos;t requested this email, there&apos;s nothing to worry about - you can safely ignore it.',
        ].join('\n'),
        htmlMessage: `
            <p class="text-lg font-bold">Hi ${name}</p>
            <p>${message}</p>
            <div class="my-md text-center text-lg font-bold">
                ${token}
            </div>
            <p>Note that this code expires in 1 hour and can only be used once.</p>
            <p>If you haven&apos;t requested this email, there&apos;s nothing to worry about - you can safely ignore it.</p>
        `,
    };
}
