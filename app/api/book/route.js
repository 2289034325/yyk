import { addBook, getBooked } from '@database/db'
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export const GET = async (request) => {
    try {
        const books = getBooked(Date.now(), Date.now())
        return new Response(JSON.stringify(books), { status: 200 })
    } catch (error) {
        return new Response("システムエラー", { status: 500 })
    }
}

export const POST = async (request) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const ut = await getToken({ req: request });
        const token = ut.token;
        const user = jwt.verify(token, secret);

        const { title, start, end } = await request.json()
        const b = addBook(user.id, title, start, end)

        return new Response(JSON.stringify(b), { status: 200 })
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
} 