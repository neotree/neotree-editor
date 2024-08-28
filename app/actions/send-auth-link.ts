'use server';

import { _getUser } from '@/databases/queries/users';
import * as mutations from '@/databases/mutations/tokens';
import logger from "@/lib/logger";
import { sendMail } from '@/mailer';
import { _getToken } from '@/databases/queries/tokens';
import { getAuthLinkEmail } from '@/mailer/get-auth-link-email';

export async function sendAuthLink({ userIdOrEmail, tokenId }: {
    userIdOrEmail: string;
    tokenId?: number;
}): Promise<{ errors?: string[]; tokenId?: null | number; }>  {
    try {
        const user = await _getUser(userIdOrEmail);

        let newTokenId: number | null = null;

        if (user) {
            let token: Awaited<ReturnType<typeof _getToken>>;

            if (tokenId) {
                token = await _getToken(tokenId);
            }

            if (!token) {
                token = await mutations._addUserToken({
                    userId: user.userId!,
                    hoursValid: 1,
                });
            }

            await sendMail({
                toEmail: user.email!,
                ...getAuthLinkEmail({ name: user.displayName!, token: token.token, }),
            });

            newTokenId = token.id;
        }

        return { tokenId: newTokenId, };
    } catch(e: any) {
        logger.error('sendAuthLink ERROR', e);
        return { errors: [e.message], };
    }
}
