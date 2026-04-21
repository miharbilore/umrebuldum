import { NextResponse } from "next/server";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";
import { AuthRateLimit } from "@/lib/auth-rate-limit";
import { emailService } from "@/lib/email/email-service";
import { verificationCodeTemplate } from "@/lib/email/email-templates";

// Validation Schema
const registerSchema = z.object({
    name: z.string().trim().min(1, "Ad Soyad alanını doldurmanız zorunludur").min(2, "Ad Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    phone: z.string().trim().min(1, "Telefon numarası zorunludur").regex(/^\+[1-9]\d{1,14}$/, "Geçerli bir uluslararası telefon numarası giriniz (Örn: +90555...)"),
    password: z.string()
        .min(8, "Şifre en az 8 karakter olmalıdır")
        .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
        .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
        .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
    role: z.enum(["USER", "GUIDE", "ORGANIZATION"]),
});

export async function POST(req: Request) {
    console.log("Register API Hit");
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        const bodyText = await req.text();
        console.log("Register Body:", bodyText);

        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            await AuthRateLimit.recordFailure(ip);
            console.error("JSON parse error:", e);
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const rawEmail = body?.email;
        const lockout = await AuthRateLimit.checkLockout(ip, rawEmail);
        if (!lockout.allowed) {
            return NextResponse.json({ error: lockout.reason || "Too many attempts" }, { status: 429 });
        }

        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            await AuthRateLimit.recordFailure(ip, rawEmail);
            console.error("Validation failed:", JSON.stringify(validation.error.format()));
            return NextResponse.json(
                { error: "Geçersiz veriler", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, email, phone, password, role } = validation.data;
        console.log("Valid data for:", email, role);

        // Check if user exists (Email or Phone)
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        });

        if (existingUser) {
            await AuthRateLimit.recordFailure(ip, email);
            const isEmailConflict = existingUser.email === email;
            const message = isEmailConflict 
                ? "Bu e-posta adresi zaten kullanımda" 
                : "Bu telefon numarası zaten kullanımda";
            
            console.log(`Registration conflict: ${isEmailConflict ? 'Email' : 'Phone'} exists - ${isEmailConflict ? email : phone}`);
            
            return NextResponse.json(
                { error: message, conflict: isEmailConflict ? 'email' : 'phone' },
                { status: 409 }
            );
        }

        console.log("Hashing password...");
        let hashedPassword = "";
        try {
            hashedPassword = await bcrypt.hash(password, 10);
            console.log("Password hashed.");
        } catch (hashError) {
            console.error("Bcrypt error:", hashError);
            return NextResponse.json(
                { error: "Şifreleme hatası" },
                { status: 500 }
            );
        }

        // Generate Verification Code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Create User + Profile in atomic transaction
        let newUser;
        try {
            console.log("Starting Prisma Transaction...");
            newUser = await prisma.$transaction(async (tx) => {
                console.log("Creating user...", { name, email, phone, role });
                const user = await tx.user.create({
                    data: {
                        name,
                        fullName: name, // DOĞRU: fullName artık User tablosunda
                        email,
                        phone,
                        passwordHash: hashedPassword,
                        role,
                        verificationCode,
                        verificationExpiry,
                        isVerified: false,
                        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                        // DOĞRU: Paket bilgisi User tablosunda tutuluyor
                        packageType: (role === 'GUIDE' || role === 'ORGANIZATION') ? "FREEMIUM" : undefined,
                    }
                });

                console.log("User created with ID:", user.id);

                // If GUIDE or ORGANIZATION, create profile
                if (role === 'GUIDE' || role === 'ORGANIZATION') {
                    console.log(`Creating ${role} profile for user ${user.id}...`);
                    await tx.guideProfile.create({
                        data: {
                            userId: user.id,
                            quotaTarget: 100,
                            currentCount: 0,
                            // fullName, phone, city, package ve tokens alanları kopyalanmayı önlemek için kaldırıldı
                        }
                    });

                    console.log(`Created profile for ${role}: ${email}.`);
                }

                return user;
            });
            console.log("Prisma Transaction Successful.");
        } catch (dbError) {
            console.error("Database transaction failed:", dbError);
            return NextResponse.json({ error: "Veritabanı kayıt hatası", details: dbError }, { status: 500 });
        }

        // This guarantees: SUM(ledger) == tokenBalance for all users.
        // Empty ledger state is IMPOSSIBLE after this point.
        const initialTokens = (role === 'GUIDE' || role === 'ORGANIZATION') ? 15 : 0;

        try {
            console.log("Granting initial tokens...");
            await grantToken({
                userId: newUser.id,
                amount: initialTokens,
                type: "INITIAL_BALANCE",
                reason: "INITIAL_BALANCE",
                idempotencyKey: `register:${newUser.id}`,
            });
            console.log(`Seeded ledger for ${email}: ${initialTokens} tokens (role: ${role}).`);
        } catch (tokenError) {
            console.error("Failed to grant token error:", tokenError);
            return NextResponse.json({ error: "Token grant hatası", details: tokenError }, { status: 500 });
        }

        console.log("User saved.");

        // ── Send OTP Verification Email via Resend ──────────────────────
        try {
            const template = verificationCodeTemplate({ code: verificationCode, email, name });
            const emailResult = await emailService.sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
                type: "verification",
            });

            if (emailResult.success) {
                console.log(`[Register] Verification email sent to ${email} (id: ${emailResult.id})`);
            } else {
                console.error(`[Register] Failed to send verification email to ${email}:`, emailResult.error);
            }
        } catch (emailError) {
            // Email failure should NOT block registration — code is in DB,
            // user can request resend later.
            console.error("[Register] Email send exception:", emailError);
        }

        // Dev fallback: also log to console + file for local testing
        if (process.env.NODE_ENV === "development") {
            console.log("----------------------------------------------");
            console.log(`[DEV] Verification Code for ${email}: ${verificationCode}`);
            console.log("----------------------------------------------");
            try {
                const fs = require('fs');
                const path = require('path');
                const dataDir = path.join(process.cwd(), "data");
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }
                const filePath = path.join(dataDir, "dev-verify.json");
                fs.writeFileSync(filePath, JSON.stringify({ email, code: verificationCode, timestamp: new Date().toISOString() }));
            } catch (error) {
                console.error("Failed to save dev verify code:", error);
            }
        }

        // Clear tracking on successful registration
        await AuthRateLimit.recordSuccess(ip, email);

        return NextResponse.json({ success: true, email });

    } catch (error: any) {
        console.error("Registration Critical Error:", error);
        return NextResponse.json(
            {
                error: "Kayıt işlemi sırasında bir hata oluştu",
                debug: error?.message || String(error)
            },
            { status: 500 }
        );
    }
}
