import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Handle client-side updates
            if (trigger === "update" && session) {
                if (typeof session.requires_onboarding === "boolean") {
                    token.requires_onboarding = session.requires_onboarding;
                }
            }

            if (user) {
                token.role = (user as any).role || null;
                token.packageType = (user as any).packageType || null;
                token.tokenBalance = (user as any).tokenBalance || 0;
                token.phone = (user as any).phone || null;
                token.fullName = (user as any).fullName || (user as any).name || null;
                token.requires_onboarding = !token.role;
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
                
                (session.user as any).packageType = token.packageType ?? "FREEMIUM";
                (session.user as any).tokenBalance = token.tokenBalance ?? 0;
                (session.user as any).phone = token.phone ?? null;
                (session.user as any).fullName = token.fullName ?? null;
            }
            return session;
        },
        authorized() {
            // Let proxy.ts / middleware.ts handle all redirect logic
            return true;
        },
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        }
    },
    providers: [], 
} satisfies NextAuthConfig
