import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect all admin routes except login
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/login')) {
    // Check for admin_token cookie (set by login page)
    const adminToken = request.cookies.get('admin_token')
    const adminSession = request.cookies.get('adminSession')
    
    // Allow access if either cookie exists (backward compatibility)
    if (!adminToken && !adminSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
