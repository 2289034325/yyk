import { getSpecialBookable } from '../../../../database/db';

export const GET = async (request) => {
    try {
        const sbs = getSpecialBookable()
        return new Response(JSON.stringify(sbs), { status: 200 })

    } catch (error) {
        return new Response("システムエラー", { status: 500 })
    }
}

