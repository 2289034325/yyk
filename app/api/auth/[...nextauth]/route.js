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

                return user;
            },
        })
    ],
    callbacks: {
        async jwt(params) {
            const { token, user, trigger, session } = params
            if (user) token.role = user.role
            if (trigger === "update" && session?.name) {
                token.name = session.name
            }
            return token
        },
        async session(params) {
            const { session, token } = params
            session.user.role = token.role
            session.user.id = token.sub
            return session
        }
    },
})

export { handler as GET, handler as POST }


