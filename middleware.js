import { NextResponse } from 'next/server'

export function middleware(request) {
    const userToken = request.cookies.get('next-auth.session-token')?.value;

    if (!userToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/', '/profile'],
}