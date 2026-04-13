import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Facebook from "next-auth/providers/facebook"

import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { AuthRateLimit } from "./auth-rate-limit"
import { emailService } from "./email/email-service"
import { verificationLinkTemplate } from "./email/email-templates"
import { generateSecret, verify } from "otplib"

// Extend session type
declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            role?: string;
            requires_onboarding?: boolean;
            wp_user_id?: number | string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            phone?: string | null;
            contactConsent?: boolean;
            packageType?: string;
            tokenBalance?: number;
            isPhoneVerified?: boolean;
        }
    }
}

if (!process.env.AUTH_SECRET) {
    console.warn("AUTH_SECRET is not defined. Generating a fallback secret for development.");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    useSecureCookies: process.env.NODE_ENV === "production",
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },

    callbacks: {
        // â”€â”€ JWT Callback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Merges auth.config.ts logic (role, onboarding, OAuth stub)
        // with auth.ts logic (custom fields, manual refresh).
        async jwt({ token, user, account, trigger, session }) {

            // â”€â”€â”€ FROM auth.config.ts: Client-side update handling â”€â”€â”€â”€
            if (trigger === "update" && session) {
                // SECURITY: Never accept role from client-side updates.
                if (typeof session.requires_onboarding === "boolean") {
                    token.requires_onboarding = session.requires_onboarding;
                }
                // Re-read role from DB (authoritative source)
                if (token.email) {
                    try {
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

            // â”€â”€â”€ FROM auth.ts: Custom field mapping on first login â”€â”€â”€
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role || null;
                token.phone = (user as any).phone;
                token.contactConsent = (user as any).contactConsent;
                token.packageType = (user as any).packageType;
                token.tokenBalance = (user as any).tokenBalance;
                token.isPhoneVerified = (user as any).isPhoneVerified;
                token.requires_onboarding = !token.role;

                // â”€â”€â”€ FROM auth.config.ts: OAuth First-Login Stub â”€â”€â”€â”€â”€
                if (!token.role && account && ["google", "facebook", "apple"].includes(account.provider)) {
                    try {
                        const email = token.email as string;
                        const dbUser = await prisma.user.findUnique({
                            where: { email },
                            select: { id: true, role: true },
                        });

                        if (dbUser && !dbUser.role) {
                            await prisma.user.update({
                                where: { id: dbUser.id },
                                data: { role: "USER", isVerified: true },
                            });
                            token.role = "USER";
                            token.requires_onboarding = true;
                            console.log(`[OAuth] Default USER role assigned to ${email} (${account.provider})`);
                        } else if (dbUser?.role) {
                            token.role = dbUser.role;
                            token.requires_onboarding = false;
                        }
                    } catch (e) {
                        console.error("[OAuth] Role assignment failed:", e);
                    }
                }
            }

            // â”€â”€â”€ FROM auth.config.ts: DB fallback for role-less tokens â”€â”€
            if (!token.role && token.email) {
                try {
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

            // â”€â”€â”€ FROM auth.config.ts: Final role guards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            if (!token.role) token.requires_onboarding = true;
            if (token.role === "BANNED") token.requires_onboarding = false;

            // â”€â”€â”€ FROM auth.ts: Manual refresh (trigger === "update") â”€
            if (trigger === "update" && token.id) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: {
                            packageType: true,
                            tokenBalance: true,
                            role: true,
                            phone: true,
                            contactConsent: true,
                            isPhoneVerified: true
                        }
                    });

                    if (dbUser) {
                        token.packageType = dbUser.packageType;
                        token.tokenBalance = dbUser.tokenBalance;
                        token.role = dbUser.role;
                        token.phone = dbUser.phone;
                        token.contactConsent = dbUser.contactConsent;
                        token.isPhoneVerified = dbUser.isPhoneVerified;
                    }
                } catch (e) {
                    console.error("[Auth] JWT session refresh failed:", e);
                }
            }

            return token;
        },

        // â”€â”€ Session Callback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Merges auth.config.ts (role, onboarding, billing sync)
        // with auth.ts (custom field transfer to frontend).
        async session({ session, token }) {
            if (session.user) {
                // FROM auth.ts: Custom fields
                session.user.id = (token.id as string) || token.sub as string;
                session.user.role = (token.role as string) || undefined;
                session.user.phone = token.phone as string | null;
                session.user.contactConsent = token.contactConsent as boolean;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;

                // FROM auth.config.ts: Onboarding flag
                session.user.requires_onboarding = !session.user.role;

                // FROM auth.config.ts: Fresh packageType/tokenBalance from DB
                if (token.sub || token.id) {
                    try {
                        const userId = (token.sub || token.id) as string;
                        const dbUser = await prisma.user.findUnique({
                            where: { id: userId },
                            select: { packageType: true, tokenBalance: true },
                        });
                        if (dbUser) {
                            session.user.packageType = (dbUser.packageType as string) ?? "FREEMIUM";
                            session.user.tokenBalance = dbUser.tokenBalance ?? 0;
                        }
                    } catch (e) {
                        console.error("[Session] packageType/tokenBalance refresh failed:", e);
                        // Fallback to JWT values
                        session.user.packageType = (token.packageType as string) ?? "FREEMIUM";
                        session.user.tokenBalance = (token.tokenBalance as number) ?? 0;
                    }
                } else {
                    // No user ID available, use JWT values
                    session.user.packageType = (token.packageType as string) ?? "FREEMIUM";
                    session.user.tokenBalance = (token.tokenBalance as number) ?? 0;
                }
            }
            return session;
        },

        // FROM auth.config.ts: Authorization (pass-through)
        authorized() {
            return true;
        },

        // FROM auth.config.ts: Open redirect protection
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        }
    },

    providers: [
        Google,
        Apple,
        Facebook,

        // â”€â”€ Email Magic Link (via Resend) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Endpoint: /api/auth/signin/email
        // ── Email Magic Link (via Resend) ────────────────────────────
        // Endpoint: /api/auth/signin/email
        {
            id: "email",
            type: "email",
            name: "Email",
            from: process.env.EMAIL_FROM || "UmreBuldum <noreply@umrebuldum.com>",
            maxAge: 24 * 60 * 60,
            async sendVerificationRequest({ identifier: email, url }: { identifier: string; url: string }) {
                const template = verificationLinkTemplate({ url, email });

                const result = await emailService.sendEmail({
                    to: email,
                    subject: template.subject,
                    html: template.html,
                    type: "verification",
                });

                if (!result.success) {
                    throw new Error(`[Auth] Verification email failed: ${result.error}`);
                }
            },
            options: {},
        } as any,

        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                totpCode: { label: "2FA Code", type: "text" }
            },

            async authorize(credentials, req) {
                const request = req as any;
                const ip = request?.headers?.get?.("x-forwarded-for") ?? "unknown";
                const email = (credentials?.email as string)?.toLowerCase().trim();

                const lockout = await AuthRateLimit.checkLockout(ip, email);
                if (!lockout.allowed) {
                    throw new Error("Invalid credentials");
                }

                if (!email || !credentials?.password) {
                    await AuthRateLimit.recordFailure(ip, email);
                    return null;
                }

                const bcrypt = await import("bcryptjs");

                const user = await prisma.user.findUnique({
                    where: { email }
                });

                if (!user || !user.passwordHash) {
                    await AuthRateLimit.recordFailure(ip, email);
                    throw new Error("Invalid credentials");
                }

                const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

                if (!isValid) {
                    await AuthRateLimit.recordFailure(ip, email);
                    throw new Error("Invalid credentials");
                }

                if (!user.isVerified) {
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                // 2FA Kontrolü
                if (user.isTwoFactorEnabled) {
                    const totpCode = (credentials as any)?.totpCode as string | undefined;

                    if (!totpCode) {
                        throw new Error("2FA_REQUIRED");
                    }



                    if (!user.twoFactorSecret) {
                        throw new Error("2FA setup not initialized");
                    }

                    const isValidToken = await verify({
                        token: totpCode,
                        secret: user.twoFactorSecret
                    });

                    if (!isValidToken) {
                        const storedCodes = user.twoFactorRecoveryCodes as string[] | null;

                        if (storedCodes && storedCodes.length > 0) {
                            const { verifyRecoveryCode } = await import("./recovery-codes");
                            const matchIndex = await verifyRecoveryCode(totpCode, storedCodes);

                            if (matchIndex >= 0) {
                                const updatedCodes = [...storedCodes];
                                updatedCodes.splice(matchIndex, 1);

                                await prisma.user.update({
                                    where: { id: user.id },
                                    data: { twoFactorRecoveryCodes: updatedCodes },
                                });
                            } else {
                                await AuthRateLimit.recordFailure(ip, email);
                                throw new Error("INVALID_2FA");
                            }
                        } else {
                            await AuthRateLimit.recordFailure(ip, email);
                            throw new Error("INVALID_2FA");
                        }
                    }
                }

                await AuthRateLimit.recordSuccess(ip, email);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    phone: user.phone,
                    contactConsent: user.contactConsent,
                    packageType: user.packageType,
                    tokenBalance: user.tokenBalance,
                    isPhoneVerified: user.isPhoneVerified,
                    requires_onboarding: !user.role || !user.phone
                };
            }
        })
    ],
})
