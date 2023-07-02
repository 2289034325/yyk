import { editUserInfo } from '../../../database/db';
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { headers } from 'next/headers';

export const PUT = async (request) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = (headers().get("authorization") || '').split("Bearer ").at(1)
        const user = jwt.verify(token, secret);
        if (!user)
            return new Response("システムエラー", { status: 401 })

        const { id, name } = await request.json()
        const newUser = editUserInfo(id, name)

        const newToken = jwt.sign(newUser, secret);

        return new Response(newToken)
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}