import { getToken } from "next-auth/jwt";
import { addBook, deleteBook, editBook, getBook, getBooked } from '../../../database/db';
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

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
        //!!! headers().get("authorization") 神经病
        const token = (headers().get("authorization") || '').split("Bearer ").at(1)
        const user = jwt.verify(token, secret);
        if (!user)
            return new Response("システムエラー", { status: 401 })

        const { id, title, start, end } = await request.json()
        addBook(user.id, id, title, start, end)

        return new Response()
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}

export const PUT = async (request) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = (headers().get("authorization") || '').split("Bearer ").at(1)
        const user = jwt.verify(token, secret);
        if (!user)
            return new Response("システムエラー", { status: 401 })

        const { id, title, start, end } = await request.json()
        const book = getBook(id)
        if (book?.userId != user?.id)
            return new Response("システムエラー", { status: 500 })

        editBook(id, title, start, end)

        return new Response()
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}

//nextjs 13.4 bug
//cannot get request body in delete method request
//pass the id as dynamic api path or by url parameter
export const DELETE = async (request) => {
    try {
        //ugly degin
        const id = request.nextUrl.searchParams.get("id");

        const secret = process.env.NEXTAUTH_SECRET;
        const token = (headers().get("authorization") || '').split("Bearer ").at(1)
        const user = jwt.verify(token, secret);
        if (!user)
            return new Response("システムエラー", { status: 401 })

        const book = getBook(id)
        if (book?.userId != user?.id)
            return new Response("システムエラー", { status: 500 })

        // const { id } = await request.json()
        deleteBook(id)

        return new Response('', { status: 200 })
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
} 