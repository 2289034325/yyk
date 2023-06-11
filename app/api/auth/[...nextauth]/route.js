import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials'
import jwt from "jsonwebtoken";

import { authenticate, logon } from '@database/db';

const handler = NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                    placeholder: 'example@example.com'
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials, req) {
                const email = credentials.email;
                const password = credentials.password;

                const user = authenticate(email, password);

                const secret = process.env.NEXTAUTH_SECRET;
                const token = jwt.sign(user, secret);

                user.token = token;

                return user;
            },
        })
    ],
    callbacks: {
        async jwt(params) {
            const { token, user } = params;
            return { ...token, ...user };
        },
        async session(params) {
            const { session, token } = params;
            session.user = token;
            return session;
        }
    },
})

export { handler as GET, handler as POST }


