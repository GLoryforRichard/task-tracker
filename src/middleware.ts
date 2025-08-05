import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
        },
      },
    }
  )

  // 检查用户是否登录
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 可选：保留调试日志但减少噪音
  if (request.nextUrl.pathname !== '/.well-known/appspecific/com.chrome.devtools.json') {
    console.log('Middleware check:', {
      pathname: request.nextUrl.pathname,
      user: user ? 'logged in' : 'not logged in',
      userEmail: user?.email
    })
  }

  // 保护的路由
  const protectedRoutes = ['/dashboard', '/calendar', '/charts', '/goals']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // 如果访问受保护路由但未登录，重定向到登录页
  if (isProtectedRoute && !user) {
    console.log('Redirecting to login from', request.nextUrl.pathname)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 如果已登录用户访问登录/注册页，重定向到dashboard
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) {
    console.log('Redirecting to dashboard from', request.nextUrl.pathname)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}