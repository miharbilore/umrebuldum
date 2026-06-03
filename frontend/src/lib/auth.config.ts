import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // 1. Handle client-side updates or session refreshes
            if (trigger === "update") {
                // Fetch the most recent data from the database to ensure session is 100% accurate
                if (token.sub || token.id) {
                    try {
                        // Dynamic import to prevent Edge runtime crashes in middleware
                        const { prisma } = await import("@/lib/prisma");
                        const userId = (token.sub || token.id) as string;
                        const dbUser = await prisma.user.findUnique({
                            where: { id: userId },
                            select: { role: true, packageType: true, fullName: true, name: true, phone: true, city: true }
                        });

                        if (dbUser) {
                            token.role = dbUser.role || null;
                            token.packageType = dbUser.packageType || "FREEMIUM";
                            token.fullName = dbUser.fullName || dbUser.name || null;
                            token.phone = dbUser.phone || null;
                            token.city = dbUser.city || null;
                        }
                    } catch (err) {
                        console.error("Failed to fetch fresh user data during session update:", err);
                        // Fallback to client session payload if DB fetch fails
                        if (session) {
                            if (session.role) token.role = session.role;
                            if (session.fullName) token.fullName = session.fullName;
                            if (session.name) token.fullName = session.name;
                            if (session.phone) token.phone = session.phone;
                            if (session.city) token.city = session.city;
                            if (session.packageType) token.packageType = session.packageType;
                        }
                    }
                }
            }

            // 2. Initial login mapping
            if (user) {
                token.role = (user as any).role || null;
                token.packageType = (user as any).packageType || "FREEMIUM";
                token.phone = (user as any).phone || null;
                token.fullName = (user as any).fullName || (user as any).name || null;
                token.city = (user as any).city || null;
                token.slug = (user as any).slug || null;
            }

            // 3. Final Onboarding Flag (matches middleware logic)
            // A user needs onboarding if they lack a role, phone, or city
            // ADMIN users are always exempt from onboarding
            const hasRequiredFields = !!(token.role && token.phone && token.city);
            
            // Eğer kullanıcının henüz bir rolü yoksa kesinlikle onboarding'e gitmelidir
            token.requires_onboarding = !token.role || !hasRequiredFields;
            
            // Safety: Banned users are not "needs onboarding", they are just blocked
            if (token.role === "BANNED" || token.role === "ADMIN") token.requires_onboarding = false;

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = (token.sub || token.id) as string;
                session.user.role = (token.role as string) || undefined;
                session.user.fullName = (token.fullName as string) || null;
                session.user.phone = (token.phone as string) || null;
                session.user.city = (token.city as string) || null;
                session.user.slug = (token.slug as string) || null;
                session.user.packageType = (token.packageType as string) || "FREEMIUM";
                session.user.requires_onboarding = !!token.requires_onboarding;
            }
            return session;
        },

        authorized() {
            // Let middleware.ts handle all redirection/guard logic globally
            return true;
        },

        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        }
    },
    providers: [], 
} satisfies NextAuthConfig
