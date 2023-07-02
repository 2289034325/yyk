import { NextResponse } from 'next/server'

export function middleware(request) {
    const userToken = request.cookies.get('next-auth.session-token')?.value;

    console.log(request.url, userToken)

    if (!userToken) {
        // console.log(request.cookies)

        //!!! ACTODO cause endless loop of loading homepage
        // return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/', '/profile'],
}