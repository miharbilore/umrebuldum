import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // Handle client-side updates (e.g. update({ role: ... }))
            if (trigger === "update" && session) {
                // SECURITY: Never accept role from client-side updates.
                // Only allow safe fields (e.g., requires_onboarding flag).
                if (typeof session.requires_onboarding === "boolean") {
                    token.requires_onboarding = session.requires_onboarding;
                }
                // Role changes MUST go through /api/set-role or /api/choose-role.
                // Re-read role from DB to ensure it's authoritative.
                if (token.email) {
                    try {
                        const { prisma } = await import("@/lib/prisma");
                        const dbUser = await prisma.user.findUnique({
                            where: { email: token.email as string },
                            select: { role: true }
                        });
                        if (dbUser?.role) {
                            token.role = dbUser.role;
                            token.requires_onboarding = false;
                        }
                    } catch (e) {
                        console.error("DB role refresh failed:", e);
                    }
                }
            }

            // On sign-in: read role from the user object (set by authorize() or adapter)
            if (user) {
                token.role = (user as any).role || null;
                token.requires_onboarding = !token.role;

                // â”€â”€â”€ OAuth First-Login Stub â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // When a user signs in via OAuth (Google/Facebook/Apple) for
                // the first time, the PrismaAdapter creates a DB user but
                // does NOT set a role. We detect this and assign "USER" as
                // the default role so the session is immediately usable.
                if (!token.role && account && ["google", "facebook", "apple"].includes(account.provider)) {
                    try {
                        const { prisma } = await import("@/lib/prisma");
                        const email = token.email as string;

                        // Check if user already has a role in DB
                        const dbUser = await prisma.user.findUnique({
                            where: { email },
                            select: { id: true, role: true },
                        });

                        if (dbUser && !dbUser.role) {
                            // First-time OAuth user â†’ assign default USER role
                            await prisma.user.update({
                                where: { id: dbUser.id },
                                data: { role: "USER", isVerified: true },
                            });
                            token.role = "USER";
                            token.requires_onboarding = true; // Still needs onboarding for role selection
                            console.log(`[OAuth] Default USER role assigned to ${email} (${account.provider})`);
                        } else if (dbUser?.role) {
                            token.role = dbUser.role;
                            token.requires_onboarding = false;
                        }
                    } catch (e) {
                        console.error("[OAuth] Role assignment failed:", e);
                    }
                }
                // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            }

            // If token still has no role, try to read from DB (handles token refresh)
            if (!token.role && token.email) {
                try {
                    const { prisma } = await import("@/lib/prisma");
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email as string },
                        select: { role: true }
                    });
                    if (dbUser?.role) {
                        token.role = dbUser.role;
                        token.requires_onboarding = false;
                    }
                } catch (e) {
                    console.error("DB role lookup failed:", e);
                }
            }

            if (!token.role) token.requires_onboarding = true;
            if (token.role === "BANNED") token.requires_onboarding = false;

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const role = (token.role as string) || null;
                session.user.role = role || undefined;
                session.user.requires_onboarding = !role;
                if (token.sub) {
                    (session.user as any).id = token.sub;
                }

                // â”€â”€ Taze packageType ve tokenBalance'ı DB'den çek â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // JWT çerezi eski paket bilgisi taşıyabilir; her session okumada
                // User tablosundan güncel veriyi alarak "stale session" sorununu önlüyoruz.
                if (token.sub) {
                    try {
                        const { prisma } = await import("@/lib/prisma");
                        const dbUser = await prisma.user.findUnique({
                            where: { id: token.sub },
                            select: { packageType: true, tokenBalance: true },
                        });
                        if (dbUser) {
                            (session.user as any).packageType = dbUser.packageType ?? "FREEMIUM";
                            (session.user as any).tokenBalance = dbUser.tokenBalance ?? 0;
                        }
                    } catch (e) {
                        console.error("[Session] packageType/tokenBalance refresh failed:", e);
                    }
                }
            }
            return session;
        },
        authorized() {
            // Let middleware.ts handle all redirect logic
            return true;
        },
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        }
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
