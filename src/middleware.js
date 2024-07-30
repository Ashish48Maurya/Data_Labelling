import { NextResponse } from 'next/server';

export function middleware(req) {
    const auth = req.cookies.get("token");
    const { pathname } = req.nextUrl;

    const authPages = ['/user', '/worker'];

    const isProtectedPage = authPages.some((path) => pathname.startsWith(path));

    if (isProtectedPage) {
        if (!auth) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',            
        '/user/:path*', 
        '/worker/:path*', 
    ],
};
