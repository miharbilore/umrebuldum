import { NextResponse } from "next/server";

export const PUBLIC_ROUTES = [
    "/", "/login", "/register", "/about", "/contact", "/faq",
    "/terms", "/privacy", "/help", "/kvkk", "/cookies",
    "/listing-terms", "/refund-policy", "/consent",
    "/auth/verify", "/forgot-password", "/reset-password",
    "/umre-rehberi", "/request", "/sanal-tur", "/yasam-rehberi", "/pricing"
];

export const ONBOARDING_PATH = "/onboarding";
export const LOGIN_PATH = "/login";
export const DASHBOARD_PATH = "/dashboard";
export const ADMIN_DASHBOARD_PATH = "/admin/dashboard";

export function isPublicPath(pathname: string): boolean {
    return PUBLIC_ROUTES.includes(pathname);
}

export function isPublicBrowsing(pathname: string): boolean {
    // 1. Direct Public Prefixes
    if (
        pathname.startsWith("/tours") || 
        pathname.startsWith("/listings/") ||
        pathname.startsWith("/organizers/") ||
        pathname.startsWith("/guide/")
    ) {
        return true;
    }

    // 2. pSEO / Root-level Slugs (if they don't match protected prefixes)
    const isRootLevel = pathname.split("/").length === 2; // e.g., "/slug"
    const protectedPrefixes = ["/dashboard", "/admin", "/onboarding", "/api", "/auth"];
    if (isRootLevel && !protectedPrefixes.some(p => pathname.startsWith(p))) {
        return true;
    }

    return false;
}

export function getRedirectUrl(path: string, nextUrl: URL): URL {
    return new URL(path, nextUrl);
}

export function createForbiddenResponse() {
    return new NextResponse(
        JSON.stringify({ error: "Forbidden", code: "FORBIDDEN" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
    );
}
