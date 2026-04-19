import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { safeErrorMessage } from "@/lib/safe-error";

export async function GET(req: Request) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "all";
        const status = searchParams.get("status") || "all";
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        const where: any = {
            OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ]
        };

        if (role !== "all" && role !== "all-users") {
            where.role = role.toUpperCase();
        }

        if (status !== "all") {
            // Mapping UI status to DB status if needed
            // For now, let's keep it simple
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    fullName: true,
                    name: true,
                    email: true,
                    role: true,
                    packageType: true,
                    tokenBalance: true,
                    trustScore: true,
                    createdAt: true,
                    isIdentityVerified: true,
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({ 
            success: true,
            users, 
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
    }
}
