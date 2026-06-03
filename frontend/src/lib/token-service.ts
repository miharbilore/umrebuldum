import { prisma } from "./prisma";
import { grantToken } from "@/modules/tokens/application/grant-token.usecase";
import { spendToken } from "@/modules/tokens/application/spend-token.usecase";
import { TokenAction } from "@/modules/tokens/domain/token-policy";
import { Prisma } from "../../prisma/generated-client";

/**
 * TOKEN SERVICE FACADE
 * 
 * This class provides backward compatibility for legacy code while
 * delegating all business logic to the new @/modules/tokens system.
 * 
 * Standardized on:
 * - Isolation Level: SERIALIZABLE (handled by use cases)
 * - Single Source of Truth: User.tokenBalance
 * - Immutable Ledger: TokenTransaction table
 */
export class TokenService {
    // Shared constants
    static readonly COST_GUIDE_INTEREST = 5;
    static readonly COST_ORG_INTEREST = 10;
    static readonly COST_FEATURE = 10;
    static readonly MAX_FEATURED_LISTINGS = 3;

    /**
     * Get current balance from User.tokenBalance.
     */
    static async getBalance(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokenBalance: true },
        });
        return user?.tokenBalance ?? 0;
    }

    /**
     * Facade for spendToken use case.
     */
    static async deductCredits(
        userId: string,
        cost: number,
        reason: string,
        relatedId?: string,
        idempotencyKey?: string
    ): Promise<{ success: boolean; newBalance: number; idempotent?: boolean }> {
        const result = await spendToken({
            userId,
            action: (reason.split(':')[0] as TokenAction) || "OTHER",
            relatedId: idempotencyKey || relatedId,
            reason: reason,
            overrideCost: cost
        });

        return {
            success: result.ok,
            newBalance: result.newBalance,
            idempotent: (result as any).alreadyProcessed
        };
    }

    /**
     * Facade for grantToken use case.
     */
    static async grantCredits(
        userId: string,
        amount: number,
        type: "purchase" | "refund" | "admin",
        reason: string,
        relatedId?: string,
        idempotencyKey?: string,
        tx?: Prisma.TransactionClient
    ): Promise<number> {
        const typeMap: Record<string, "PURCHASE" | "REFUND" | "ADMIN_GRANT"> = {
            purchase: "PURCHASE",
            refund: "REFUND",
            admin: "ADMIN_GRANT"
        };

        const result = await grantToken({
            userId,
            amount,
            type: typeMap[type] || "ADMIN_GRANT",
            reason,
            relatedId,
            idempotencyKey: idempotencyKey || `grant_${userId}_${Date.now()}`,
            tx
        });

        return result.newBalance;
    }

    /**
     * Returns authoritative User.tokenBalance.
     */
    static async syncBalance(userId: string): Promise<number> {
        return this.getBalance(userId);
    }
}
