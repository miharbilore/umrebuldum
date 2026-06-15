import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/ledger
 * Fetch token ledger transactions for the admin panel.
 */
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const limitStr = url.searchParams.get('limit') || '50';
        const limit = parseInt(limitStr);

        // Fetch transactions from TokenTransaction table
        const transactions = await prisma.tokenTransaction.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        // Format for the LedgerPanel component
        const formattedData = transactions.map(tx => ({
            id: tx.id,
            action: tx.entryType, // "PURCHASE", "USAGE", "ADJUSTMENT", "REFUND" etc.
            accountId: tx.accountId,
            counterpartyId: tx.counterpartyId,
            amount: tx.amount,
            reason: tx.reasonCode,
            createdAt: tx.createdAt.toISOString(),
            user: tx.user
        }));

        // Summary metrics
        const totalUserTokensAgg = await prisma.user.aggregate({ _sum: { tokenBalance: true } });
        const systemBurnAgg = await prisma.tokenTransaction.aggregate({
            where: { accountId: 'SYSTEM_BURN', amount: { gt: 0 } },
            _sum: { amount: true }
        });

        const metrics = {
            totalTokensInCirculation: totalUserTokensAgg._sum.tokenBalance || 0,
            totalTokensBurned: systemBurnAgg._sum.amount || 0,
        };

        return NextResponse.json({ data: formattedData, metrics });

    } catch (e) {
        console.error("GET admin/ledger error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
