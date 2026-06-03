import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { 
    isPublicPath, 
    isPublicBrowsing, 
    getRedirectUrl, 
    createForbiddenResponse,
    ONBOARDING_PATH,
    LOGIN_PATH,
    DASHBOARD_PATH,
    ADMIN_DASHBOARD_PATH
} from "@/lib/middleware-utils"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const user = req.auth?.user
    const role = user?.role

    const isApiRoute = nextUrl.pathname.startsWith("/api")
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isStaticAsset = nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".")

    // 1. Static and Auth API Bypass
    if (isApiAuthRoute || isStaticAsset) {
        return NextResponse.next()
    }

    // 2. API Protection Layer
    if (isApiRoute) {
        if (nextUrl.pathname.startsWith('/api/admin')) {
            if (!isLoggedIn || role !== 'ADMIN') return createForbiddenResponse()
        }
        return NextResponse.next()
    }

    // 3. Authenticated User Flow
    if (isLoggedIn && user) {
        // A. Banned Check
        if (role === "BANNED") {
            if (isPublicPath(nextUrl.pathname) || isPublicBrowsing(nextUrl.pathname)) return NextResponse.next()
            return NextResponse.redirect(getRedirectUrl("/", nextUrl))
        }

        // B. Public Access Check (Allow public routes without further checks)
        if (isPublicPath(nextUrl.pathname) || isPublicBrowsing(nextUrl.pathname)) {
            return NextResponse.next()
        }

        // C. Onboarding Check
        const needsOnboarding = !!user.requires_onboarding
        const isOnboardingRoute = nextUrl.pathname === ONBOARDING_PATH

        if (needsOnboarding) {
            if (isOnboardingRoute) return NextResponse.next()
            return NextResponse.redirect(getRedirectUrl(ONBOARDING_PATH, nextUrl))
        }

        // D. Auth/Onboarding Page Guard (Redirect away if already finished)
        if (isOnboardingRoute || nextUrl.pathname === LOGIN_PATH) {
            const dest = role === "ADMIN" ? ADMIN_DASHBOARD_PATH : DASHBOARD_PATH
            return NextResponse.redirect(getRedirectUrl(dest, nextUrl))
        }

        // D. Role-Based Access Control (RBAC)
        // Admin Paths
        if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(getRedirectUrl("/", nextUrl))
        }
        // Dashboard Admin Override
        if (nextUrl.pathname.startsWith(DASHBOARD_PATH) && role === "ADMIN") {
            if (nextUrl.pathname === `${DASHBOARD_PATH}/settings`) return NextResponse.next()
            return NextResponse.redirect(getRedirectUrl(ADMIN_DASHBOARD_PATH, nextUrl))
        }
        // Guide/Org Paths
        if (nextUrl.pathname.startsWith("/guide") && role !== "GUIDE" && role !== "ORGANIZATION") {
            return NextResponse.redirect(getRedirectUrl(DASHBOARD_PATH, nextUrl))
        }
        if (nextUrl.pathname.startsWith("/org") && role !== "ORGANIZATION") {
            return NextResponse.redirect(getRedirectUrl(DASHBOARD_PATH, nextUrl))
        }
    } 
    // 4. Guest Flow
    else {
        if (isPublicPath(nextUrl.pathname) || isPublicBrowsing(nextUrl.pathname)) return NextResponse.next()
        
        const searchParams = new URLSearchParams(nextUrl.search)
        searchParams.set("callbackUrl", nextUrl.pathname)
        return NextResponse.redirect(getRedirectUrl(`${LOGIN_PATH}?${searchParams.toString()}`, nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api/auth|.+\\.[\\w]+$|_next).*)"],
}
