import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { safeErrorMessage } from "@/lib/safe-error";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const body = await req.json();

        // allowed fields to update
        const { tokenBalance, role, isBanned } = body;

        const data: any = {};
        
        if (tokenBalance !== undefined) {
            const parsedBalance = Number(tokenBalance);
            if (isNaN(parsedBalance) || !Number.isInteger(parsedBalance) || parsedBalance < 0) {
                return NextResponse.json({ error: "Geçersiz token bakiyesi. Sadece pozitif tam sayılar girilebilir." }, { status: 400 });
            }
            data.tokenBalance = parsedBalance;
        }
        
        if (role !== undefined) {
            data.role = String(role);
        }
        
        const currentUser = await prisma.user.findUnique({ where: { id } });
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Handle Banning correctly
        if (isBanned === true) {
            if (currentUser.role !== "BANNED") {
                data.role = "BANNED";
                data.previousRole = currentUser.role;
            }
        } else if (isBanned === false) {
            if (currentUser.role === "BANNED") {
                data.role = currentUser.previousRole || "USER";
                data.previousRole = null;
            }
        }

        // Just blindly pass the data the client sends for these simple fields
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                tokenBalance: true,
                previousRole: true
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
    }
}
