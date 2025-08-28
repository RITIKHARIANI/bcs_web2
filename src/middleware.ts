import { auth } from "@/lib/auth/config"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/faculty')) {
    return Response.redirect(new URL('/auth/login', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
