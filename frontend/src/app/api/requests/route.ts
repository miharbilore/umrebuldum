
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, requireSupply } from "@/lib/api-guards";
import { z } from "zod";

interface CreateRequest {
    departureCity: string;
    peopleCount: string;
    dateRange: string;
    budget?: string;
    note?: string;
    roomType?: string;
    contactViaEmail?: boolean;
    contactViaPhone?: boolean;
    contactViaChat?: boolean;
}

const createRequestSchema = z.object({
    departureCity: z.string().min(1, "Kalkış şehri zorunludur").max(100, "Kalkış şehri çok uzun"),
    peopleCount: z.string().regex(/^\d+$/, "Kişi sayısı sayısal olmalıdır"),
    dateRange: z.string().min(1, "Tarih aralığı zorunludur").max(100, "Tarih aralığı çok uzun"),
    budget: z.string().regex(/^\d+(\.\d{1,2})?$/, "Geçersiz bütçe formatı").optional(),
    note: z.string().max(500, "Not en fazla 500 karakter olabilir").optional(),
    roomType: z.string().max(50, "Oda tipi çok uzun").optional(),
    contactViaEmail: z.boolean().optional(),
    contactViaPhone: z.boolean().optional(),
    contactViaChat: z.boolean().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireRole(session, 'USER');
        if (guard) return guard;


        const body = await req.json();
        const validation = createRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message, details: validation.error.format() },
                { status: 400 }
            );
        }
        const { departureCity, peopleCount, dateRange, budget, note, roomType, contactViaEmail, contactViaPhone, contactViaChat } = validation.data;

        // Check request limit (Max 3)
        const existingCount = await prisma.umrahRequest.count({
            where: {
                userEmail: session!.user.email!,
                status: 'open'
            }
        });

        if (existingCount >= 3) {
            return NextResponse.json({
                error: "Limit Reached",
                message: "En fazla 3 adet aktif talep oluşturabilirsiniz."
            }, { status: 403 });
        }

        const newRequest = await prisma.umrahRequest.create({
            data: {
                userEmail: session!.user.email!,
                departureCity,
                peopleCount: parseInt(peopleCount),
                dateRange,
                roomType: roomType || "2-kisilik",
                budget: budget ? parseFloat(budget) : null,
                note: note || null,
                status: "open",
                contactViaEmail: contactViaEmail || false,
                contactViaPhone: contactViaPhone || false,
                contactViaChat: contactViaChat !== false // Default true if undefined
            }
        });

        return NextResponse.json({
            ...newRequest,
            createdAt: newRequest.createdAt.toISOString()
        }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Create request error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Create request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const guard = requireRole(session, 'USER');
        if (guard) return guard;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const request = await prisma.umrahRequest.findUnique({
            where: { id }
        });

        if (!request) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        if (request.userEmail !== session!.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.umrahRequest.update({
            where: { id },
            data: { status: 'deleted', deletedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Delete request error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Delete request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // BANNED check
        if (session.user.role === 'BANNED') {
            return NextResponse.json({ error: "Account banned" }, { status: 403 });
        }

        const role = session.user.role;
        let requests;
        let contactedRequestIds = new Set<string>();

        if (role === 'USER') {
            // User sees their own requests
            requests = await prisma.umrahRequest.findMany({
                where: { userEmail: session!.user.email! },
                orderBy: { createdAt: 'desc' }
            });
        } else if (role === 'GUIDE' || role === 'ORGANIZATION') {
            // Guides/Orgs see all open requests
            requests = await prisma.umrahRequest.findMany({
                where: { status: "open" },
                orderBy: { createdAt: 'desc' }
            });

            // Find which ones the guide has already contacted
            const interests = await prisma.requestInterest.findMany({
                where: { guideEmail: session!.user.email! },
                select: { requestId: true }
            });
            contactedRequestIds = new Set(interests.map(i => i.requestId));
        } else {
            return NextResponse.json({ error: "Unauthorized Role" }, { status: 403 });
        }

        // Remove sensitive info (userEmail) - but keep status for User
        const cleanRequests = requests.map(r => ({
            id: r.id,
            departureCity: r.departureCity,
            peopleCount: r.peopleCount,
            dateRange: r.dateRange,
            roomType: r.roomType,
            budget: r.budget,
            note: r.note,
            status: r.status, // Include status
            isContacted: contactedRequestIds.has(r.id),
            createdAt: r.createdAt.toISOString(),
        }));

        return NextResponse.json(cleanRequests);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Get requests error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("Get requests error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
