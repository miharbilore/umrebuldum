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
            fullName?: string | null;
            phone?: string | null;
            city?: string | null;
            slug?: string | null;
            bio?: string | null;
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
    adapter: PrismaAdapter(prisma as any),
    session: { strategy: "jwt" },
    providers: [
        Google,
        Apple,
        Facebook,

        // ── Email Magic Link (via Resend) ────────────────────────────
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
                    slug: user.slug,
                    requires_onboarding: !user.role || !user.phone || !user.city
                };
            }
        })
    ],
})
