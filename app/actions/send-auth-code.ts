'use server';

import { _getUser } from '@/databases/queries/users';
import * as mutations from '@/databases/mutations/tokens';
import logger from "@/lib/logger";
import { sendMail } from '@/mailer';
import { getAuthCodeEmail } from '@/mailer/get-auth-code-email';
import { _getToken } from '@/databases/queries/tokens';

export async function sendAuthCode({ email, tokenId }: {
    email: string;
    tokenId?: number;
}): Promise<{ errors?: string[]; tokenId?: number; }> {
    try {
        if (!email) throw new Error('Email address not provided');

        const user = await _getUser(email);

        if (!user) throw new Error('Email address not registered, are you sure that address is typed correctly?');

        let token: Awaited<ReturnType<typeof _getToken>>;

        if (tokenId) token = await _getToken(tokenId);

        if (!token) {
            token = await mutations._addUserToken({
                userId: user.userId!,
                hoursValid: 1,
            });
        }

        await sendMail({
            toEmail: user.email!,
            ...getAuthCodeEmail({ name: user.displayName!, token: token.token, }),
        });

        return { tokenId: token.id, };
    } catch(e: any) {
        logger.error('sendAuthCode ERROR', e);
        return { errors: [e.message], };
    }
}
