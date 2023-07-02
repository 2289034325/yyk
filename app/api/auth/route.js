import { authenticate } from "../../../database/db";
import jwt from "jsonwebtoken";

export const POST = async (request) => {
    try {

        const { email, password } = await request.json()
        console.log(email, password)

        const user = authenticate(email, password);
        if (!user)
            return new Response("入力されたメールアドレスまたはパスワードに誤りがあります。", { status: 500 })

        const secret = process.env.NEXTAUTH_SECRET;
        const token = jwt.sign(user, secret);

        return new Response(token)
    } catch (error) {
        console.log(error)
        return new Response("システムエラー", { status: 500 })
    }
}