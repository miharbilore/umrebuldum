import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const user = req.auth?.user
    const role = user?.role;

    // ── Path constants ──
    const onboardingPath = "/onboarding"
    const loginPath = "/login"

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isApiRoute = nextUrl.pathname.startsWith("/api");
    const isStaticAsset = nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".");

    const publicRoutes = [
        "/", "/login", "/register", "/about", "/contact", "/faq",
        "/terms", "/privacy", "/help", "/kvkk", "/cookies",
        "/listing-terms", "/refund-policy", "/consent",
        "/auth/verify", "/forgot-password", "/reset-password"
    ];
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isPublicBrowsing = nextUrl.pathname.startsWith("/tours") || nextUrl.pathname.startsWith("/listings/");
    const isAuthRoute = nextUrl.pathname === loginPath;
    const isOnboardingRoute = nextUrl.pathname === onboardingPath;

    // 1. API route protection block
    if (isApiRoute) {
        // Protect /api/admin/* natively BEFORE granting 'return null' bypass to all APIs
        if (nextUrl.pathname.startsWith('/api/admin')) {
            if (!isLoggedIn || role !== 'ADMIN') {
                return new NextResponse(
                    JSON.stringify({ error: "Forbidden: Admin access required", code: "FORBIDDEN" }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }
        }
        // Allow all other APIs (NextAuth will handle their specific protection individually)
        return null;
    }

    // Always allow API auth and static assets
    if (isApiAuthRoute || isStaticAsset) {
        return null;
    }

    // 2. Logged-in users
    if (isLoggedIn) {
        const hasRole = !!user?.role;
        const isBanned = user?.role === "BANNED";

        // ── SCENARIO: BANNED user ──
        if (isBanned) {
            if (isPublicRoute || isPublicBrowsing) return null;
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        // ── SCENARIO A: Needs onboarding (no role) ──
        const requiresOnboarding = !hasRole;
        if (requiresOnboarding) {
            if (isOnboardingRoute) return null;
            if (isPublicRoute || isPublicBrowsing) return null;
            return NextResponse.redirect(new URL(onboardingPath, nextUrl));
        }

        // ── SCENARIO B: Has role (fully onboarded) ──
        
        // Block onboarding page → go to correct dashboard
        if (isOnboardingRoute) {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        // Block login page → go to correct dashboard
        if (isAuthRoute) {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        // ── Role protection ──
        // /admin/* → ADMIN only
        if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        // /dashboard/* → USER, GUIDE, ORGANIZATION (not ADMIN — admin has /admin/*)
        // Exception: /dashboard/settings is allowed for ADMIN (password change)
        if (nextUrl.pathname.startsWith("/dashboard") && role === "ADMIN") {
            if (nextUrl.pathname === "/dashboard/settings") {
                return null; // Allow admin to access settings
            }
            return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
        }

        // /guide/* → GUIDE or ORGANIZATION only
        if (nextUrl.pathname.startsWith("/guide") && role !== "GUIDE" && role !== "ORGANIZATION") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        // /org/* → ORGANIZATION only
        if (nextUrl.pathname.startsWith("/org") && role !== "ORGANIZATION") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }

    // 3. Guest (not logged in)
    else {
        if (isPublicRoute || isPublicBrowsing) {
            return null;
        }
        return NextResponse.redirect(new URL(loginPath, nextUrl));
    }

    return null;
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
}
