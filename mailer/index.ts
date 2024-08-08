import nodemailer, { SendMailOptions as NodeMailerSendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
// @ts-ignore
import inlineBase64 from 'nodemailer-plugin-inline-base64';

import { getLogoBase64 } from '@/lib/getLogoBase64';
import colors from '@/constants/colors';
import logger from '@/lib/logger';

export interface SendMailOptions {
    toEmail: string | string[];
    subject: string;
    textMessage: string;
    htmlMessage?: string;
    messageTitle?: string;
};

export async function sendMail({
    toEmail,
    subject,
    textMessage,
    htmlMessage,
    messageTitle,
}: SendMailOptions) {
    const logo = await getLogoBase64('logo.png');
    const logoLight = await getLogoBase64('logo-light.png');

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PW,
        },
    });

    transporter.use('compile', inlineBase64({ cidPrefix: 'wellToDoHedgehog107', }));

    const mailOptions: NodeMailerSendMailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: typeof toEmail === 'string' ? [toEmail] : toEmail,
        subject: `[${process.env.NEXT_PUBLIC_APP_NAME}] ${subject}`,
        text: textMessage,
        html: html({
            logo,
            logoLight,
            body: htmlMessage || textMessage,
            title: messageTitle,
        }),
    };

    await new Promise<SMTPTransport.SentMessageInfo>((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.error('sendEmail ERR', error.message);
                reject(error);
            } else {
                return resolve(info);
            }
        });
    });
}

function html({ title, body, logo, logoLight }: {
    logo?: string;
    logoLight?: string;
    body: string;
    title?: string;  
}) {
    const spacings: { [key: string]: string; } = {
        sm: '6px',
        md: '16px',
        lg: '24px',
    };

    const widths: { [key: string]: string; }  = {
        xs: '200px',
        sm: '400px',
        md: '800px',
        lg: '1200px',
    };

    const flexAlignments: { [key: string]: string; }  = {
        center: 'center',
        end: 'flex-end',
        start: 'flex-start',
        baseline: 'baseline',
    };

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">

                <style>
                    .font-normal {
                        font-family: "Roboto", sans-serif;
                        font-weight: 400;
                        font-style: normal;
                        font-size: 16px;
                    }

                    .font-bold {
                        font-family: "Roboto", sans-serif;
                        font-weight: 700;
                        font-style: normal;
                    }

                    .block { display: block; }
                    .inline { display: inline; }
                    .inline-block { display: inline-block; }
                    .inline-flex { display: inline-flex; }
                    .flex { display: flex; }

                    .flex-row { flex-flow: row; }
                    .flex-col { flex-flow: column; }
                    .flex-1 { flex: 1; }

                    a {
                        text-decoration: none;
                        color: ${colors.primary.DEFAULT};
                    }
                    
                    ${['center', 'end', 'start', 'baseline'].map(alignment => {
                        return `
                            .items-${alignment} { align-items: ${flexAlignments[alignment]}; }
                            .justify-${alignment} { justify-content: ${flexAlignments[alignment]}; }
                        `;
                    }).join('')}

                    .w-full { width: 100%; }
                    .min-w-full { min-width: 100%; }
                    .w-auto { width: auto; }

                    .h-full { height: 100%; }
                    .min-h-full { min-height: 100%; }
                    .h-auto { height: auto; }

                    .m-auto { margin: auto; }
                    .ml-auto { margin-left: auto; }
                    .mr-auto { margin-right: auto; }
                    .mt-auto { margin-top: auto; }
                    .mb-auto { margin-bottom: auto; }

                    .text-primary { color: ${colors.primary.DEFAULT}; }
                    .text-primary-foreground { color: ${colors.primary.foreground}; }
                    .text-secondary { color: ${colors.secondary.DEFAULT}; }
                    .text-secondary-foreground { color: ${colors.secondary.foreground}; }
                    .text-danger { color: ${colors.danger.DEFAULT}; }
                    .text-danger-foreground { color: ${colors.danger.foreground}; }
                    .text-success { color: ${colors.success.DEFAULT}; }
                    .text-success-foreground { color: ${colors.success.foreground}; }

                    .bg-primary { background-color: ${colors.primary.DEFAULT}; }
                    .bg-primary-foreground { background-color: ${colors.primary.foreground}; }
                    .bg-secondary { background-color: ${colors.secondary.DEFAULT}; }
                    .bg-secondary-foreground { background-color: ${colors.secondary.foreground}; }
                    .bg-danger { background-color: ${colors.danger.DEFAULT}; }
                    .bg-danger-foreground { background-color: ${colors.danger.foreground}; }
                    .bg-success { background-color: ${colors.success.DEFAULT}; }
                    .bg-success-foreground { background-color: ${colors.success.foreground}; }

                    .text-sm { font-size: 12px; }
                    .text-base { font-size: 16px; }
                    .text-lg { font-size: 24px; }

                    .text-left { text-align: left; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .text-justify { text-align: justify; }

                    ${['sm', 'md', 'lg'].map(size => {
                        return `
                            .w-${size} { width: ${widths[size]}; }
                            .max-w-${size} { max-width: ${widths[size]}; }
                            .min-w-${size} { min-width: ${widths[size]}; }

                            .m-${size} { margin: ${spacings[size]}; }
                            .ml-${size} { margin-left: ${spacings[size]}; }
                            .mr-${size} { margin-right: ${spacings[size]}; }
                            .mt-${size} { margin-top: ${spacings[size]}; }
                            .mb-${size} { margin-bottom: ${spacings[size]}; }
                            .mx-${size} { 
                                margin-left: ${spacings[size]}; 
                                margin-right: ${spacings[size]}; 
                            }
                            .my-${size} { 
                                margin-top: ${spacings[size]}; 
                                margin-bottom: ${spacings[size]}; 
                            }

                            .p-${size} { padding: ${spacings[size]}; }
                            .pl-${size} { padding-left: ${spacings[size]}; }
                            .pr-${size} { padding-right: ${spacings[size]}; }
                            .pt-${size} { padding-top: ${spacings[size]}; }
                            .pb-${size} { padding-bottom: ${spacings[size]}; }
                            .px-${size} { 
                                padding-left: ${spacings[size]}; 
                                padding-right: ${spacings[size]}; 
                            }
                            .py-${size} { 
                                padding-top: ${spacings[size]}; 
                                padding-bottom: ${spacings[size]}; 
                            }
                        `;
                    }).join('')}

                    #logo { display: block; }
                    #logoLight { display: none; }

                    @media (prefers-color-scheme: dark) {
                        #logo { display: none; }
                        #logoLight { display: block; }
                    }
                </style>
            </head>

            <body class="text-base font-normal">
                <div style="width:100%;max-width:${widths.md};margin:auto;">
                    <div>
                        ${!(logo || logoLight) ? '' : `
                            <div style="width:100%;max-width:${widths.xs};margin:auto;">
                                <img
                                    id="logo"
                                    src="${logo || logoLight}"
                                    alt="${process.env.NEXT_PUBLIC_APP_NAME}"
                                    style="width:100%;height:auto;"
                                />
                                <img
                                    id="logoLight"
                                    src="${logoLight || logo}"
                                    alt="${process.env.NEXT_PUBLIC_APP_NAME}"
                                    style="width:100%;height:auto;"
                                />
                            </div>    
                        `}

                        ${!title ? '' : `
                            <div style="margin-bottom:${spacings.md};">
                                ${title}
                            </div>    
                        `}

                        <div style="margin-bottom:${spacings.md};">
                            ${body}
                        </div>

                        <div style="display:flex;align-items:center;justify-content:flex-end;">
                            <span>&copy;&nbsp;</span>
                            <a style="color:${colors.primary.DEFAULT};" href="${process.env.NEXT_PUBLIC_APP_URL}">Neotree</a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
}
