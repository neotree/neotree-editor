export function getTestEmailData() {
    return {
        subject: '1,2 testing',
        textMessage: `Hi, just testing ${process.env.NEXT_PUBLIC_APP_NAME} emails. You can check out the site, here's the link: ${process.env.NEXT_PUBLIC_APP_URL}`,
        htmlMessage: `
            <p>Hi, just testing ${process.env.NEXT_PUBLIC_APP_NAME} emails.</p>
            <p>You can check out the site <a href="${process.env.NEXT_PUBLIC_APP_URL}">here</a></p>
        `,
    };
}
