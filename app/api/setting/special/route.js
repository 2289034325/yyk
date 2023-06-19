import { addBook, deleteBook, editBook, getBooked, getSpecialBookable } from '@database/db'
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export const GET = async (request) => {
    try {
        const sbs = getSpecialBookable()
        return new Response(JSON.stringify(sbs), { status: 200 })

    } catch (error) {
        return new Response("システムエラー", { status: 500 })
    }
}

