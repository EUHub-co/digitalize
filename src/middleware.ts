import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LOCALES = ['en', 'sk', 'de'];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const locale = pathname.split('/')[1];

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', VALID_LOCALES.includes(locale) ? locale : 'en');

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', '/'],
};
