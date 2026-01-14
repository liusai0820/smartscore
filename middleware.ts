import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hardcoded to avoid importing server-only modules in middleware
const ADMIN_COOKIE_NAME = 'smartscore_admin_token'

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for admin token
    const token = request.cookies.get(ADMIN_COOKIE_NAME)

    // If no token or invalid, redirect to login
    if (!token || token.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
