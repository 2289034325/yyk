import { addBook, deleteBook, editBook, getBooked, getDefaultBookable, setDefaultBookable } from '@database/db'
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export const GET = async (request) => {
    try {
        const dbs = getDefaultBookable()
        return new Response(JSON.stringify(dbs), { status: 200 })

    } catch (error) {
        return new Response("システムエラー", { status: 500 })
    }
}

export const PUT = async (request) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const ut = await getToken({ req: request });
        const token = ut.token;
        const user = jwt.verify(token, secret);

        const settings = await request.json()
        setDefaultBookable(settings)

        return new Response('', { status: 200 })
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}