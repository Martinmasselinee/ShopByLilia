import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isClient = token?.role === 'CLIENT'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isClientRoute = req.nextUrl.pathname.startsWith('/client')

    // Redirect admin to admin dashboard if accessing client routes
    if (isAdmin && isClientRoute) {
      return NextResponse.redirect(new URL('/admin/clients', req.url))
    }

    // Redirect client to client dashboard if accessing admin routes
    if (isClient && isAdminRoute) {
      return NextResponse.redirect(new URL('/client/profile', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthRoute = req.nextUrl.pathname.startsWith('/login') || 
                           req.nextUrl.pathname.startsWith('/register')
        const isDashboardRoute = req.nextUrl.pathname.startsWith('/admin') || 
                                req.nextUrl.pathname.startsWith('/client')

        // Allow access to auth routes
        if (isAuthRoute) {
          return true
        }

        // Require authentication for dashboard routes
        if (isDashboardRoute) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*', 
    '/client/:path*',
    // Exclude static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|icons).*)',
  ]
}

