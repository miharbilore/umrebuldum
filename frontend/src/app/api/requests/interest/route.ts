import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireSupply } from "@/lib/api-guards";
import { spendToken } from "@/modules/tokens/application/spend-token.usecase";
import { rateLimit } from "@/lib/rate-limit";
import { getRoleConfig } from "@/lib/role-config";
import { safeErrorMessage } from "@/lib/safe-error";

interface RequestInterestBody {
    requestId: string;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const body = (await req.json()) as RequestInterestBody;
        const { requestId } = body;
        if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

        // Rate limit: 10 interests per minute per guide
        const user = session!.user;
        const rl = await rateLimit(`interest:${user.email}`, 60_000, 10);
        if (!rl.success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        // Verify request exists and is open
        const request = await prisma.umrahRequest.findUnique({
            where: { id: requestId }
        });
        if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
        if (request.status !== "open") return NextResponse.json({ error: "Request is closed" }, { status: 400 });

        // Find guide user
        const guideUser = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        });
        if (!guideUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Check for duplicate interest (idempotent early exit — free, no credits needed)
        const existingInterest = await prisma.requestInterest.findUnique({
            where: {
                requestId_guideEmail: {
                    requestId,
                    guideEmail: session!.user.email!
                }
            }
        });

        if (existingInterest) {
            // Find existing conversation to link directly
            const existingConvo = await prisma.conversation.findUnique({
                where: {
                    requestId_guideId: { requestId, guideId: guideUser.id }
                }
            });
            return NextResponse.json({ 
                message: "Already expressed interest",
                already_contacted: true,
                conversationId: existingConvo?.id
            }, { status: 200 });
        }

        // Find request owner
        const requestOwner = await prisma.user.findUnique({
            where: { email: request.userEmail }
        });
        if (!requestOwner) return NextResponse.json({ error: "Request owner not found" }, { status: 404 });

        // ─── Get cost from ROLE_CONFIG ───
        const roleConfig = getRoleConfig(session!.user.role);
        const expectedCost = roleConfig.interestCost;
        console.log(`[Interest API] Processing for ${guideUser.email}, Role: ${session!.user.role}, interestCost: ${expectedCost}`);

        // ─── Daily interest limit check ───
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const dailyInterestCount = await prisma.requestInterest.count({
            where: {
                guideEmail: session!.user.email!,
                createdAt: { gte: startOfDay },
            }
        });
        if (dailyInterestCount >= roleConfig.maxDailyInterests) {
            return NextResponse.json(
                { error: "Daily interest limit reached", limit: roleConfig.maxDailyInterests },
                { status: 429 }
            );
        }

        console.log(`[Interest API] Initiating spendToken for DEMAND_UNLOCK. Expected cost: ${expectedCost}`);
        const spendResult = await spendToken({
            userId: guideUser.id,
            action: "DEMAND_UNLOCK",
            relatedId: requestId,
            reason: `Express interest in request ${requestId}`,
            overrideCost: expectedCost, // Ensure it uses 5 for Guides instead of the hardcoded 3
        });
        console.log(`[Interest API] spendToken Result: ok=${spendResult.ok}, error=${spendResult.error}, newBalance=${spendResult.newBalance}`);


        if (!spendResult.ok) {
            if (spendResult.error === "INSUFFICIENT_TOKENS") {
                return NextResponse.json({
                    error: "INSUFFICIENT_CREDITS",
                    message: "Yetersiz Token",
                    balance: spendResult.newBalance,
                }, { status: 402 });
            }
            return NextResponse.json({ error: spendResult.error }, { status: 400 });
        }

        // ─── Create interest + conversation (post-spend) ───
        try {
            await prisma.$transaction(async (tx) => {
                await tx.requestInterest.create({
                    data: {
                        requestId,
                        guideEmail: session!.user!.email!,
                    }
                });

                const existingConvo = await tx.conversation.findUnique({
                    where: {
                        requestId_guideId: { requestId, guideId: guideUser.id }
                    }
                });

                if (!existingConvo) {
                    await tx.conversation.create({
                        data: {
                            requestId,
                            guideId: guideUser.id,
                            userId: requestOwner.id,
                        }
                    });
                }
            });
        } catch (error: unknown) {
            // P2002 on requestInterest unique constraint — parallel race
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                return NextResponse.json({ message: "Interest already recorded", creditsRemaining: spendResult.newBalance }, { status: 200 });
            }
            throw error;
        }

        console.log(`[Interest] Deducted ${spendResult.cost} tokens from ${guideUser.id}. New balance: ${spendResult.newBalance}`);
        return NextResponse.json({ message: "Interest recorded", creditsRemaining: spendResult.newBalance }, { status: 201 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Interest error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Interest error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
