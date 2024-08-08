import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { getActiveMailerSettings, getMailerSettings } from "@/app/actions/mailer";
import logger from '@/lib/logger';

export type SendMailOptions = Parameters<nodemailer.Transporter['sendMail']>[0] & {
    
};

export async function sendMail(
    mailOptions: SendMailOptions,
    configOpts?: {
        mailerSettingsId?: number
    }
) {
    const response: { 
        errors?: string[]; 
        success: boolean;
        info: null | nodemailer.SentMessageInfo;
    } = { success: false, info: null, };

    try {
        const { errors, transporter, mailerSettings, } = await getNodemailerTransporter(configOpts?.mailerSettingsId);

        if (errors?.length) {
            response.success = false;
            response.errors = response.errors;
            return response;
        }

        if (transporter) {
            response.info = await transporter.sendMail({
                ...mailOptions,
                from: `"${mailerSettings!.fromName}" <${mailerSettings!.fromAddress}>`,
                sender: mailerSettings!.fromAddress,
            });
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('sendMail ERROR', e.message);
    } finally {
        return response;
    }
}

async function getNodemailerTransporter(mailerSettingsId?: number) {
    const response: { 
        errors?: string[]; 
        transporter: null | ReturnType<typeof nodemailer.createTransport>; 
        mailerSettings?: Awaited<ReturnType<typeof getActiveMailerSettings>>['data'];
    } = {
        transporter: null,
    };

    try {
        const res = mailerSettingsId ? { data: null, } : await getActiveMailerSettings();

        if (res?.errors?.length) {
            response.errors = res.errors;
            return response;
        }

        let mailerSettings = res?.data;

        if (mailerSettingsId) {
            const { data, errors } = await getMailerSettings({ ids: [mailerSettingsId], });

            if (errors?.length) {
                response.errors = errors;
                return response;
            }

            mailerSettings = data[0];
        }

        if (!mailerSettings) {
            response.errors = ['Failed to send email'];
            logger.error('getNodemailerTransporter ERROR', 'Failed to load mailer settings');
            return response;
        }

        if (mailerSettings.service === 'gmail') {
            response.transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: mailerSettings.authUsername,
                    pass: mailerSettings.authPassword,
                },
            });
        }

        if (mailerSettings.service === 'smtp') {
            response.transporter = nodemailer.createTransport({
                host: mailerSettings.host,
                port: mailerSettings.port,
                secure: mailerSettings.secure,
                auth: {
                    user: mailerSettings.authUsername,
                    pass: mailerSettings.authPassword,
                },
            } as SMTPTransport.Options);
        }

        if (!response.transporter) {
            response.errors = ['Failed to send email'];
            logger.error('getNodemailerTransporter ERROR', 'Failed to configure nodemailer transporter');
            return response;
        }

        response.mailerSettings = mailerSettings;
    } catch(e: any) {
        response.errors = [e.message];
        logger.error('getNodemailerTransporter ERROR', e.message);
    } finally {
        return response;
    }
}
