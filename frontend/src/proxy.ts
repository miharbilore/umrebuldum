import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: any) {
    const { nextUrl } = req
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isApiRoute = nextUrl.pathname.startsWith("/api");
    const isStaticAsset = nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".");

    if (isApiAuthRoute || isStaticAsset) {
        return null;
    }

    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    const isLoggedIn = !!token
    const role = token?.role;

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

    // API routes
    if (isApiRoute) {
        if (nextUrl.pathname.startsWith('/api/admin')) {
            if (!isLoggedIn || role !== 'ADMIN') {
                return new NextResponse(
                    JSON.stringify({ error: "Forbidden", code: "FORBIDDEN" }),
                    { status: 403 }
                );
            }
        }
        return null;
    }


    // Logged-in
    if (isLoggedIn) {
        const isBanned = role === "BANNED";

        if (isBanned) {
            if (isPublicRoute || isPublicBrowsing) return null;
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        // Force onboarding if role is missing, or phone is missing/empty
        const noPhone = !token.phone || String(token.phone).trim() === "";
        const needsOnboarding = !role || noPhone;

        if (needsOnboarding) {
            if (isOnboardingRoute) return null;
            if (isPublicRoute || isPublicBrowsing) return null;
            return NextResponse.redirect(new URL(onboardingPath, nextUrl));
        }

        // User has completed onboarding — redirect away from /onboarding
        if (isOnboardingRoute) {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        if (isAuthRoute) {
            if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/dashboard") && role === "ADMIN") {
            if (nextUrl.pathname === "/dashboard/settings") return null;
            return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/guide") && role !== "GUIDE" && role !== "ORGANIZATION") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        if (nextUrl.pathname.startsWith("/org") && role !== "ORGANIZATION") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }

    // Guest
    else {
        if (isPublicRoute || isPublicBrowsing) return null;
        return NextResponse.redirect(new URL(loginPath, nextUrl));
    }

    return null;
}

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
}
