import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware: Request URL - ', request.url);
  console.log('Middleware: Request Headers - ', Array.from(request.headers.entries()));
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Add security headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Additional security measures
  response.headers.set('X-Robots-Tag', 'index, follow')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  
  // Remove potentially problematic headers
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
  
  // Ensure HTTPS in production
  if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
    const redirectUrl = `https://${request.headers.get('host')}${request.nextUrl.pathname}`
    console.log('Middleware: Production HTTP request, redirecting to HTTPS - ', redirectUrl);
    return NextResponse.redirect(redirectUrl)
  }

  console.log('Middleware: Returning response for URL - ', request.url);
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
