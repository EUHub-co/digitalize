import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LOCALES = ['en', 'sk', 'de'];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const host = (request.headers.get('host') || '').split(':')[0];

    // The infra.* subdomain serves the /infra route at its root, and must not be indexed
    // (no canonical, not in the sitemap) — attach a noindex header to every infra.* response.
    if (host.startsWith('infra.')) {
        const url = request.nextUrl.clone();
        if (!pathname.startsWith('/infra')) url.pathname = '/infra';
        const res = NextResponse.rewrite(url);
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return res;
    }

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
