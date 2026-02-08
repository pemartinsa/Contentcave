import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'contentcave-jarvis-secret-key-change-in-production',
  })

  const { pathname } = request.nextUrl

  // Allow auth pages and API routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth')
  ) {
    // Redirect to dashboard if already logged in
    if (token && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)'],
}
