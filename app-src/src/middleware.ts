import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  // Protect faculty routes
  if (req.nextUrl.pathname.startsWith('/faculty')) {
    if (!req.auth || req.auth.user.role !== 'faculty') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/faculty/:path*',
  ]
}
