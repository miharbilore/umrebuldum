import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * Server-side Auth Service
 * Provides a clean abstraction over NextAuth to prevent direct dependency
 * on auth config/handlers in domain modules.
 */

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    name?: string | null;
    fullName?: string | null;
    slug?: string | null;
    city?: string | null;
    phone?: string | null;
    requiresOnboarding: boolean;
}

/**
 * Fetches the current session and returns a normalized user object.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const session = await auth();
    
    if (!session?.user?.email || !session?.user?.id) {
        return null;
    }

    return {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role || "USER",
        name: session.user.name,
        fullName: session.user.fullName,
        slug: session.user.slug,
        city: session.user.city,
        phone: session.user.phone,
        requiresOnboarding: !!session.user.requires_onboarding
    };
}

/**
 * Ensures the user is authenticated, otherwise throws an error.
 * Useful for Server Actions and Domain Services.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("UNAUTHORIZED");
    }
    if (user.role === "BANNED") {
        throw new Error("BANNED");
    }
    return user;
}

/**
 * Checks if the current user has at least one of the required roles.
 */
export async function hasRole(roles: string | string[]): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(user.role);
}

/**
 * Shortcut for admin check.
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole("ADMIN");
}
