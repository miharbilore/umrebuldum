import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Facebook from "next-auth/providers/facebook"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { AuthRateLimit } from "./auth-rate-limit"

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
            contactConsent?: boolean;
        }
    }
}

// JWT type augmentation is handled automatically by NextAuth
// when using JWT strategy, the token types are inferred
// from the session callback

if (!process.env.AUTH_SECRET) {
    console.warn("AUTH_SECRET is not defined. Generating a fallback secret for development.");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    useSecureCookies: process.env.NODE_ENV === "production",
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Google,
        Apple,
        Facebook,
        Nodemailer({
            server: process.env.EMAIL_SERVER || {
                host: 'localhost',
                port: 2525,
                auth: { user: '', pass: '' }
            },
            from: process.env.EMAIL_FROM || 'noreply@localhost',
            async sendVerificationRequest({ identifier: email, url }) {
                if (process.env.NODE_ENV === "development") {
                    console.log("----------------------------------------------")
                    console.log(`Login Link for ${email}:`)
                    console.log(url)
                    console.log("----------------------------------------------")

                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const dataDir = path.join(process.cwd(), "data");
                        if (!fs.existsSync(dataDir)) {
                            fs.mkdirSync(dataDir, { recursive: true });
                        }
                        const filePath = path.join(dataDir, "dev-login.json");
                        fs.writeFileSync(filePath, JSON.stringify({ email, url, timestamp: new Date().toISOString() }));
                    } catch (error) {
                        console.error("Failed to save dev login link:", error);
                    }
                }
            },
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                totpCode: { label: "2FA Code", type: "text" }
            },
            async authorize(credentials, req) {
                // Determine IP address securely
                // Use type 'any' for req to bypass NextAuth strict type definitions if headers is missing on its type
                const request = req as any;
                const ip = request?.headers?.get?.("x-forwarded-for") ?? "unknown";
                const email = credentials?.email as string;

                // 1. Bruteforce Hard Check
                const lockout = await AuthRateLimit.checkLockout(ip, email);
                if (!lockout.allowed) {
                    throw new Error("Invalid credentials"); // Generic error, no leakage
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

                // --- Email Verification Check ---
                if (!user.isVerified) {
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                // --- 2FA Check ---
                if ((user as any).isTwoFactorEnabled) {
                    const totpCode = (credentials as any)?.totpCode as string | undefined;
                    
                    if (!totpCode) {
                        // User has 2FA enabled but didn't provide code -> Prompt for it
                        throw new Error("2FA_REQUIRED");
                    }
                    
                    const { verify } = await import("otplib");
                    
                    if (!(user as any).twoFactorSecret) {
                         throw new Error("2FA setup not initialized");
                    }
                    
                    const isValidToken = verify({
                        token: totpCode,
                        secret: (user as any).twoFactorSecret
                    });
                    
                    if (!isValidToken) {
                        // --- Recovery Code Fallback ---
                        const storedCodes = (user as any).twoFactorRecoveryCodes as string[] | null;
                        if (storedCodes && storedCodes.length > 0) {
                            const { verifyRecoveryCode } = await import("./recovery-codes");
                            const matchIndex = await verifyRecoveryCode(totpCode, storedCodes);
                            
                            if (matchIndex >= 0) {
                                // Valid recovery code — remove it so it can't be reused
                                const updatedCodes = [...storedCodes];
                                updatedCodes.splice(matchIndex, 1);
                                await prisma.user.update({
                                    where: { id: user.id },
                                    data: { twoFactorRecoveryCodes: updatedCodes },
                                });
                                // Recovery code accepted — proceed with login
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
                // -----------------

                // 2. Clear failures on success
                await AuthRateLimit.recordSuccess(ip, email);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    requires_onboarding: !user.role
                };
            }
        })
    ],
})
