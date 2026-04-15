import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { selectGateway, getAvailableProviders } from "@/lib/payment-router";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";
import type { PaymentProvider } from "@/lib/payment-gateway";
// DOĞRU IMPORT: İsim çakışmasını önlemek için Prisma Enum'una 'PrismaPaymentProvider' takma adı verdik
import { TransactionStatus, PaymentProvider as PrismaPaymentProvider } from "@prisma/client"; 

/**
 * POST /api/billing/checkout
 *
 * Creates a payment session via the selected provider (Stripe or PayTR).
 * Delegates to PaymentRouter which selects the appropriate gateway.
 *
 * Body: { packageId, provider?, couponCode? }
 * - provider: "stripe" | "paytr" (optional, auto-selected if omitted)
 *
 * Returns:
 * - Stripe: { url, sessionId, provider: "stripe" }
 * - PayTR:  { iframeToken, sessionId, provider: "paytr" }
 *
 * Security:
 * - Rate limit: 3 per minute per user
 * - 3D Secure: enforced by both providers
 * - No card data touches this server (SAQ-A)
 */
export async function POST(req: Request) {
    try {
        const session = await auth();

        // Only GUIDE and ORGANIZATION roles can purchase credits
        const guard = requireSupply(session);
        if (guard) return guard;

        // Rate limit: 3 checkout initiations per minute per user
        const userId = session!.user.email!;
        const rl = await rateLimit(`checkout:${userId}`, 60_000, 3);
        if (!rl.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait before trying again." },
                {
                    status: 429,
                    headers: { "Retry-After": "60" },
                }
            );
        }

        const body = await req.json();
        const { packageId, couponCode, provider: requestedProvider } = body;

        if (!packageId || typeof packageId !== "string") {
            return NextResponse.json({ error: "Missing or invalid packageId" }, { status: 400 });
        }

        // ── Validate Provider ────────────────────────────────────────────
        const availableProviders = getAvailableProviders();
        let selectedProvider: PaymentProvider | undefined;
        if (requestedProvider) {
            if (!availableProviders.includes(requestedProvider)) {
                return NextResponse.json(
                    { error: `Provider '${requestedProvider}' is not available` },
                    { status: 400 }
                );
            }
            selectedProvider = requestedProvider;
        }

        // ── Coupon Validation ────────────────────────────────────────────
        let discountPercent = 0;
        if (couponCode && typeof couponCode === "string") {
            const coupon = await (prisma as any).coupon.findUnique({
                where: { code: couponCode.toUpperCase().trim() },
            });

            if (coupon && coupon.isActive && new Date() <= new Date(coupon.expiresAt) && coupon.usedCount < coupon.maxUses) {
                discountPercent = coupon.discountPercent;
                await (prisma as any).coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { increment: 1 } },
                });
                console.log(`[Checkout] Coupon ${couponCode} applied: ${discountPercent}% off`);
            }
        }

        const baseUrl = process.env.NEXTAUTH_URL;
        if (!baseUrl) {
            console.error("[Checkout] NEXTAUTH_URL environment variable not set");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Find user's DB id
        const user = await prisma.user.findUnique({
            where: { email: session!.user.email! },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Find package
        const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
        if (!pkg) {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        const finalPrice = discountPercent > 0
            ? Number(pkg.priceTRY) * (1 - discountPercent / 100)
            : Number(pkg.priceTRY);

        console.log(`[Checkout] User ${user.id}, package ${packageId}, provider: ${selectedProvider || "auto"}`);

        // ── Dev Bypass (Test Mode Sandbox) ──────────────────────────────
        if (process.env.NODE_ENV === "development") {
            const baseTier = (pkg as any).slug || packageId;
            console.log(`[Checkout] DEV MODE: Auto-granting ${pkg.credits} credits to ${user.id}`);

            await prisma.user.update({
                where: { id: user.id },
                data: { packageType: baseTier },
            });

            await grantToken({
                userId: user.id,
                amount: pkg.credits,
                type: "PURCHASE",
                reason: `Test Mode Purchase of ${packageId}`,
                idempotencyKey: `dev_bypass_${Date.now()}_${Math.random()}`,
            });

            return NextResponse.json({
                url: `${baseUrl}/dashboard/billing?success=true`,
                sessionId: `mock_sess_${Date.now()}`,
                provider: "dev",
            });
        }

        // ── Select Gateway & Create Session ─────────────────────────────
        const gateway = selectGateway(selectedProvider);

        // Pending-session guard (prevent duplicate charges)
        const PENDING_WINDOW_MS = 10 * 60 * 1_000;
        const existingPending = await prisma.transaction.findFirst({
            where: {
                userId: user.id,
                status: TransactionStatus.PENDING, 
                // DOĞRU: Küçük harfli provider adını BÜYÜK HARFE çevirip Enum'a cast ediyoruz ("stripe" -> "STRIPE")
                provider: gateway.provider.toUpperCase() as PrismaPaymentProvider,
                createdAt: { gte: new Date(Date.now() - PENDING_WINDOW_MS) },
            },
            orderBy: { createdAt: "desc" },
        });

        if (existingPending?.sessionId && gateway.provider === "stripe") {
            // For Stripe, try to resume existing session
            try {
                const { StripeGateway } = await import("@/lib/gateways/stripe-gateway");
                const stripeGw = new StripeGateway();
                const existingSession = await stripeGw.getSessionDetails(existingPending.sessionId);
                if (existingSession.status === "open") {
                    return NextResponse.json({
                        url: existingSession.url,
                        sessionId: existingSession.id,
                        provider: "stripe",
                    });
                }
            } catch {
                // Session expired — fall through
            }
        }

        // Create PENDING Transaction row
        const pendingTx = await prisma.transaction.create({
            data: {
                userId: user.id,
                role: user.role || "GUIDE",
                credits: pkg.credits,
                amountTRY: finalPrice,
                // DOĞRU: Küçük harfli provider adını BÜYÜK HARFE çevirip Enum'a cast ediyoruz ("stripe" -> "STRIPE")
                provider: gateway.provider.toUpperCase() as PrismaPaymentProvider,
                status: TransactionStatus.PENDING, 
                sessionId: null,
                metadata: {
                    packageName: pkg.name,
                    packageSlug: (pkg as any).slug,
                    discountPercent,
                    originalPrice: Number(pkg.priceTRY), 
                },
            },
        });

        // Extract client IP for PayTR
        const forwardedFor = req.headers.get("x-forwarded-for");
        const userIp = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";

        // Create session via selected gateway
        const result = await gateway.createSession({
            userId: user.id,
            packageId,
            amountTRY: finalPrice,
            credits: pkg.credits,
            email: user.email || "",
            role: user.role || "GUIDE",
            successUrl: `${baseUrl}/dashboard/billing?success=true`,
            cancelUrl: `${baseUrl}/dashboard/billing?canceled=true`,
            internalTxId: pendingTx.id,
            couponCode: couponCode || undefined,
            userIp, // PayTR needs this
        } as any);

        // Update Transaction with session reference
        await prisma.transaction.update({
            where: { id: pendingTx.id },
            data: {
                sessionId: result.sessionId,
                providerRef: result.sessionId,
            },
        });

        console.log(`[Checkout] ${gateway.provider} session created: ${result.sessionId}`);

        // Return appropriate response based on provider type
        if (result.type === "iframe") {
            return NextResponse.json({
                iframeToken: result.iframeToken,
                sessionId: result.sessionId,
                provider: gateway.provider,
            });
        }

        return NextResponse.json({
            url: result.url,
            sessionId: result.sessionId,
            provider: gateway.provider,
        });

    } catch (err: any) {
        if (err.message === "PACKAGE_NOT_FOUND") {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }
        if (err.message === "USER_NOT_FOUND") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.error("[Checkout] Unexpected error:", err.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    const providers = getAvailableProviders();
    return NextResponse.json({ providers });
}
