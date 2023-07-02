import { getToken } from "next-auth/jwt";
import { getDefaultBookable, setDefaultBookable } from '../../../../database/db';

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
        const token = (headers().get("authorization") || '').split("Bearer ").at(1)
        const user = jwt.verify(token, secret);
        if (!user)
            return new Response("システムエラー", { status: 401 })

        if (user.role != 'admin')
            return new Response('権限なし', { status: 500 })


        const settings = await request.json()
        setDefaultBookable(settings)

        return new Response('', { status: 200 })
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}