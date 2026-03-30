import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/errors/api-handler";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/error-codes";

export const GET = withErrorHandler(async (req: Request) => {
  // 1. Security & Admin Check
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new AppError("Yetkisiz erişim", ERROR_CODES.INTERNAL_ERROR, 403);
  }

  // 2. Query SearchParams Options
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId"); // e.g., Filter by SYSTEM_BURN or User ID
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  
  // 3. Build Query Condition
  const whereCondition = accountId ? { accountId } : {};

  // 4. Fetch Ledger Details
  const transactions = await prisma.tokenTransaction.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: limit > 1000 ? 1000 : limit // Protect against extreme query caps
  });

  return NextResponse.json({
    success: true,
    data: transactions
  });
});
