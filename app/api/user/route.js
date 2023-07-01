import { editUserInfo } from '../../../database/db';
import { getToken } from "next-auth/jwt";

export const PUT = async (request) => {
    try {
        const ut = await getToken({ req: request });
        if (!ut)
            return new Response("権限エラー", { status: 500 })

        const { id, name } = await request.json()
        editUserInfo(id, name)

        return new Response()
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}