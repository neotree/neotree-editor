import bcrypt from 'bcrypt';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { and, eq } from 'drizzle-orm';
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import db from "@/databases/pg/drizzle";
import * as schema from '@/databases/pg/schema';

export const authOptions: AuthOptions = {
    // @ts-ignore
    adapter: DrizzleAdapter(db),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),

        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {
                    label: 'email',
                    type: 'text',
                },
                password: {
                    label: 'email',
                    type: 'text',
                },
                code: {
                    label: 'code',
                    type: 'text',
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !(credentials?.password || credentials?.code)) {
                    throw new Error('Missing credentials');
                }

                const user = await db.query.users.findFirst({
                    where: and(
                        eq(schema.users.email, credentials.email),
                        // isNotNull(schema.users.activationDate),
                    ),
                });

                if (!user) throw new Error('Invalid credentials');

                if (credentials.code) {
                    const token = await db.query.tokens.findFirst({
                        where: and(
                            eq(schema.tokens.token, Number(credentials.code)),
                            eq(schema.tokens.userId, user.userId),
                        ),
                    });

                    if (!token) throw new Error('That code wasn&apos;t valid. Have another go!');

                    await db.delete(schema.tokens).where(eq(schema.tokens.id, token.id));
                } else if (credentials.password) {
                    const isCorrectPassword: boolean = await bcrypt.compare(credentials.password, `${user.password}`);

                    if (!isCorrectPassword) throw new Error('Invalid credentials');
                } else {
                    if (!user) throw new Error('Invalid credentials');
                }

                const updateFields: Partial<typeof schema.users.$inferSelect> = { lastLoginDate: new Date() };
                if (!user.activationDate) updateFields.activationDate = new Date();

                await db
                    .update(schema.users)
                    .set(updateFields)
                    .where(eq(schema.users.userId, user.userId));

                return {
                    id: user.userId,
                    email: user.email,
                    emailVerified: user.activationDate || updateFields.activationDate,
                    name: user.displayName,
                    image: null,
                };
            }
        }),
    ],
    debug: process.env.NODE_ENV !== 'production',
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async redirect({ baseUrl, url }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    },
};
