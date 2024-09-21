import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const isCli = process.env.IS_CLI === 'true'

export async function middleware(request: NextRequest) {
  const pathsToRedirectInCli = ['/login', '/']

  if (isCli) {
    // This is done to prevent using supabase in cli mode
    if (pathsToRedirectInCli.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
