import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { auth: session, nextUrl } = req
  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role

  // Route checks
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isFacultyRoute = nextUrl.pathname.startsWith('/faculty')
  const isStudentRoute = nextUrl.pathname.startsWith('/student')
  const isAuthPage = nextUrl.pathname.startsWith('/auth')

  // Protect admin routes - strictest protection
  if (isAdminRoute) {
    // Not logged in - redirect to login with callback
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
      const loginUrl = new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Logged in but not admin - redirect to home with error
    if (userRole !== 'admin') {
      const homeUrl = new URL('/?error=unauthorized', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  // Protect faculty routes - allow admin and faculty
  if (isFacultyRoute) {
    // Not logged in - redirect to login with callback
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
      const loginUrl = new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Logged in but not faculty or admin - redirect to home with error
    if (userRole !== 'faculty' && userRole !== 'admin') {
      const homeUrl = new URL('/?error=unauthorized', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  // Protect student routes - allow student, faculty, and admin
  if (isStudentRoute) {
    // Not logged in - redirect to login with callback
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
      const loginUrl = new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Logged in but pending faculty - redirect to pending approval page
    if (userRole === 'pending_faculty') {
      const pendingUrl = new URL('/auth/pending-approval', req.url)
      return NextResponse.redirect(pendingUrl)
    }

    // Allow student, faculty, and admin
    if (!['student', 'faculty', 'admin'].includes(userRole || '')) {
      const homeUrl = new URL('/?error=unauthorized', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  // Redirect to home if already logged in and trying to access auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
