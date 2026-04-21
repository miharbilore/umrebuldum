import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const user = req.auth?.user
    const role = user?.role

    const isApiRoute = nextUrl.pathname.startsWith("/api")
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isStaticAsset = nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".")

    // 1. Auth API routes and static assets should never be intercepted by the guard logic
    if (isApiAuthRoute || isStaticAsset) {
        return NextResponse.next()
    }

    const onboardingPath = "/onboarding"
    const loginPath = "/login"

    const publicRoutes = [
        "/", "/login", "/register", "/about", "/contact", "/faq",
        "/terms", "/privacy", "/help", "/kvkk", "/cookies",
        "/listing-terms", "/refund-policy", "/consent",
        "/auth/verify", "/forgot-password", "/reset-password",
        "/rehber", "/sanal-tur", "/yasam-rehberi", "/umre-rehber.html", "/pricing"
    ];

    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isPublicBrowsing = nextUrl.pathname.startsWith("/tours") || nextUrl.pathname.startsWith("/listings/");
    const isAuthRoute = nextUrl.pathname === loginPath;
    const isOnboardingRoute = nextUrl.pathname === onboardingPath;

    // 2. API Routes Protection
    if (isApiRoute) {
        if (nextUrl.pathname.startsWith('/api/admin')) {
            if (!isLoggedIn || role !== 'ADMIN') {
                return new NextResponse(
                    JSON.stringify({ error: "Forbidden", code: "FORBIDDEN" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }
        }
        return NextResponse.next()
    }

    // 3. Logged-in State Logic
    if (isLoggedIn && user) {
        const isBanned = role === "BANNED";

        if (isBanned) {
            if (isPublicRoute || isPublicBrowsing) return NextResponse.next();
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        // Force onboarding if role is missing, or phone/fullName is missing/empty
        const noPhone = !user.phone || String(user.phone).trim() === "";
        const noName = !(user as any).fullName || String((user as any).fullName).trim() === "";
        const needsOnboarding = !role || noPhone || noName;

        if (needsOnboarding) {
            if (isOnboardingRoute || isApiRoute) return NextResponse.next();
            if (isPublicRoute || isPublicBrowsing) return NextResponse.next();
            return NextResponse.redirect(new URL(onboardingPath, nextUrl));
        }

        // User has completed onboarding — redirect away from /onboarding
        if (isOnboardingRoute) {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        // Logged in users shouldn't see the login page
        if (isAuthRoute) {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        // Admin checks
        if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        // Dashboard/Settings exception for admins
        if (nextUrl.pathname.startsWith("/dashboard") && role === "ADMIN") {
            if (nextUrl.pathname === "/dashboard/settings") return NextResponse.next();
            return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
        }

        // Role-based path protection
        if (nextUrl.pathname.startsWith("/guide") && role !== "GUIDE" && role !== "ORGANIZATION") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/org") && role !== "ORGANIZATION") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }
    // 4. Guest Logic
    else {
        if (isPublicRoute || isPublicBrowsing) return NextResponse.next();
        
        // Redirect to login if trying to access protected content
        const searchParams = new URLSearchParams(nextUrl.search);
        searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(new URL(`${loginPath}?${searchParams.toString()}`, nextUrl));
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
}
