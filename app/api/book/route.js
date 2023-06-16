import { addBook, deleteBook, editBook, getBooked } from '@database/db'
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export const GET = async (request) => {
    try {
        const books = getBooked(Date.now(), Date.now())

        console.log(books);

        return new Response(JSON.stringify(books), { status: 200 })
    } catch (error) {
        return new Response("システムエラー", { status: 500 })
    }
}

export const POST = async (request) => {
    try {
        console.log('POST', JSON.stringify(request), 'POST')

        const secret = process.env.NEXTAUTH_SECRET;
        const ut = await getToken({ req: request });
        const token = ut.token;
        const user = jwt.verify(token, secret);

        const { title, start, end } = await request.json()
        const b = addBook(user.id, title, start, end)

        console.log('post', b, 'post')

        return new Response(JSON.stringify(b), { status: 200 })
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}

export const PUT = async (request) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const ut = await getToken({ req: request });
        const token = ut.token;
        const user = jwt.verify(token, secret);

        const { id, title, start, end } = await request.json()
        const b = editBook(id, title, start, end)

        console.log('put', b, 'put')

        return new Response(JSON.stringify(b), { status: 200 })
    } catch (error) {
        console.log('put', error, 'put')
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
        const ut = await getToken({ req: request });
        const token = ut.token;
        const user = jwt.verify(token, secret);

        // const { id } = await request.json()
        deleteBook(id)

        return new Response('', { status: 200 })
    } catch (error) {
        console.log('delete', error, 'delete')
        return new Response("システムエラー", { status: 500 })
    }
} 