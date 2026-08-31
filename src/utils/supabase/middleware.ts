import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the session if expired.
  // It is important that this gets called on every request.
  const { data: { user } } = await supabase.auth.getUser()

  // Define protected routes mapping
  const adminRoutes = ['/admin', '/admin/surat', '/admin/keamanan', '/admin/warga', '/admin/keuangan', '/admin/pengumuman', '/admin/settings', '/admin/files']
  
  const currentPath = request.nextUrl.pathname

  // Redirect logic based on auth and roles
  if (!user && (adminRoutes.some(route => currentPath.startsWith(route)) || currentPath === '/warga')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', currentPath)
    return NextResponse.redirect(loginUrl)
  }

  // RBAC Enforcement: If user tries to access /admin but isn't admin/pengurus
  if (user && adminRoutes.some(route => currentPath.startsWith(route))) {
    const role = user.user_metadata?.role || 'warga'
    if (role !== 'admin' && role !== 'pengurus') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      // Could also redirect to a 403 Forbidden page
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Prevent authenticated users from visiting /auth pages
  if (user && currentPath.startsWith('/auth/')) {
    const redirectUrl = request.nextUrl.clone()
    const role = user.user_metadata?.role || 'warga'
    redirectUrl.pathname = (role === 'admin' || role === 'pengurus') ? '/admin' : '/'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
