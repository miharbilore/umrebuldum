import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import { TokenService } from "@/lib/token-service";

interface VerifyPhoneBody {
  idToken: string;
}

const FREEMIUM_PHONE_BONUS = 15;

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth guard: user must be logged in ──
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // ── 2. Parse request body ──
    const body = (await req.json()) as VerifyPhoneBody;
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Firebase ID Token gerekli." },
        { status: 400 }
      );
    }

    // ── 3. Verify Firebase ID Token (server-side security) ──
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (firebaseError: unknown) {
      if (firebaseError instanceof Error) {
        console.error("[verify-phone] Firebase token invalid:", firebaseError.message);
      } else {
        console.error("[verify-phone] Firebase token invalid:", firebaseError);
      }
      return NextResponse.json(
        { error: "Geçersiz doğrulama. Lütfen tekrar deneyin." },
        { status: 403 }
      );
    }

    // ── 4. Extract phone number from decoded token ──
    const verifiedPhone = decodedToken.phone_number;
    if (!verifiedPhone) {
      return NextResponse.json(
        { error: "Token'da telefon numarası bulunamadı." },
        { status: 400 }
      );
    }

    // ── 5. Check if this phone is already used by ANOTHER user ──
    const existingUser = await prisma.user.findUnique({
      where: { phone: verifiedPhone },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: "Bu telefon numarası başka bir hesaba kayıtlı." },
        { status: 409 }
      );
    }

    // ── 6. Check current verification status ──
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPhoneVerified: true },
    });

    const isFirstVerification = !currentUser?.isPhoneVerified;

    // ── 7. Update User: set phone + isPhoneVerified ──
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: verifiedPhone,
        isPhoneVerified: true,
      },
    });

    // ── 8. Grant 15 Freemium tokens ONLY on first verification ──
    let tokensGranted = 0;
    if (isFirstVerification) {
      await TokenService.grantCredits(
        userId,
        FREEMIUM_PHONE_BONUS,
        "admin",
        "Phone Verification Gift",
        undefined,
        `phone_verify:${userId}` // Idempotency key — prevents double-grant
      );
      tokensGranted = FREEMIUM_PHONE_BONUS;
    }

    console.log(
      `[verify-phone] User ${userId} verified phone ${verifiedPhone}. ` +
        `First time: ${isFirstVerification}. Tokens granted: ${tokensGranted}`
    );

    return NextResponse.json({
      success: true,
      phone: verifiedPhone,
      isPhoneVerified: true,
      tokensGranted,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[verify-phone] Unexpected error:", error.message);
    } else {
      console.error("[verify-phone] Unexpected error:", error);
    }
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
