import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSupply } from "@/lib/api-guards";
import { safeErrorMessage } from "@/lib/safe-error";

interface AutoReplenishConfigResponse {
    status: string;
    threshold: number;
    packageId: string;
    monthlyCap: number;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    error?: string;
}

interface UpdateAutoReplenishRequest {
    status?: "ACTIVE" | "PAUSED" | "DISABLED";
    threshold?: number;
    packageId?: string;
    monthlyCap?: number;
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const config = await prisma.autoReplenishConfig.findUnique({
            where: { userId: session!.user.id }
        });

        // Return a default disabled state if no config exists yet in DB
        if (!config) {
            return NextResponse.json<AutoReplenishConfigResponse>({
                status: "DISABLED",
                threshold: 20,
                packageId: "medium",
                monthlyCap: 500
            });
        }

        return NextResponse.json<AutoReplenishConfigResponse>({
            status: config.status,
            threshold: config.threshold,
            packageId: config.packageId,
            monthlyCap: config.monthlyCap,
            userId: config.userId,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        });
    } catch (error: unknown) {
        return NextResponse.json<AutoReplenishConfigResponse>({ 
            error: safeErrorMessage(error),
            status: "DISABLED",
            threshold: 0,
            packageId: "",
            monthlyCap: 0
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        const guard = requireSupply(session);
        if (guard) return guard;

        const body = (await req.json()) as UpdateAutoReplenishRequest;
        const { status, threshold, packageId, monthlyCap } = body;

        if (status && !["ACTIVE", "PAUSED", "DISABLED"].includes(status)) {
            return NextResponse.json<Partial<AutoReplenishConfigResponse>>({ error: "Invalid status value" }, { status: 400 });
        }

        const validPackages = ["small", "medium", "large", "mega", "enterprise"];
        if (packageId && !validPackages.includes(packageId)) {
            return NextResponse.json<Partial<AutoReplenishConfigResponse>>({ error: "Invalid default package ID" }, { status: 400 });
        }

        // Upsert configuration
        const updated = await prisma.autoReplenishConfig.upsert({
            where: { userId: session!.user.id },
            update: {
                status: status ?? undefined,
                threshold: threshold !== undefined ? Number(threshold) : undefined,
                packageId: packageId ?? undefined,
                monthlyCap: monthlyCap !== undefined ? Number(monthlyCap) : undefined,
            },
            create: {
                userId: session!.user.id!,
                status: status || "ACTIVE",
                threshold: threshold !== undefined ? Number(threshold) : 20,
                packageId: packageId || "medium",
                monthlyCap: monthlyCap !== undefined ? Number(monthlyCap) : 500,
            }
        });

        return NextResponse.json<AutoReplenishConfigResponse>({
            status: updated.status,
            threshold: updated.threshold,
            packageId: updated.packageId,
            monthlyCap: updated.monthlyCap,
            userId: updated.userId,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    } catch (error: unknown) {
        return NextResponse.json<Partial<AutoReplenishConfigResponse>>({ error: safeErrorMessage(error) }, { status: 500 });
    }
}
