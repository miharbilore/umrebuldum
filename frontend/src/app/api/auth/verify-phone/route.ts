import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import { TokenService } from "@/lib/token-service";

const FREEMIUM_PHONE_BONUS = 15;

export async function POST(req: NextRequest) {
  try {
    // â”€â”€ 1. Auth guard: user must be logged in â”€â”€
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // â”€â”€ 2. Parse request body â”€â”€
    const body = await req.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Firebase ID Token gerekli." },
        { status: 400 }
      );
    }

    // â”€â”€ 3. Verify Firebase ID Token (server-side security) â”€â”€
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (firebaseError: any) {
      console.error("[verify-phone] Firebase token invalid:", firebaseError.message);
      return NextResponse.json(
        { error: "Geçersiz doğrulama. Lütfen tekrar deneyin." },
        { status: 403 }
      );
    }

    // â”€â”€ 4. Extract phone number from decoded token â”€â”€
    const verifiedPhone = decodedToken.phone_number;
    if (!verifiedPhone) {
      return NextResponse.json(
        { error: "Token'da telefon numarası bulunamadı." },
        { status: 400 }
      );
    }

    // â”€â”€ 5. Check if this phone is already used by ANOTHER user â”€â”€
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

    // â”€â”€ 6. Check current verification status â”€â”€
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPhoneVerified: true },
    });

    const isFirstVerification = !currentUser?.isPhoneVerified;

    // â”€â”€ 7. Update User: set phone + isPhoneVerified â”€â”€
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: verifiedPhone,
        isPhoneVerified: true,
      },
    });

    // â”€â”€ 8. Grant 15 Freemium tokens ONLY on first verification â”€â”€
    let tokensGranted = 0;
    if (isFirstVerification) {
      await TokenService.grantCredits(
        userId,
        FREEMIUM_PHONE_BONUS,
        "admin",
        "Phone Verification Gift",
        undefined,
        `phone_verify:${userId}` // Idempotency key â€” prevents double-grant
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
  } catch (error: any) {
    console.error("[verify-phone] Unexpected error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
