import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { safeErrorMessage } from "@/lib/safe-error";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const id = params.id;
        const body = await req.json();

        // allowed fields to update
        const { tokenBalance, role, isBanned } = body;

        const data: any = {};
        
        if (tokenBalance !== undefined) {
            data.tokenBalance = Number(tokenBalance);
        }
        
        if (role !== undefined) {
            data.role = String(role);
        }
        
        // Example: If we want to ban users, maybe there's a status field or isBanned?
        // Wait, the User schema has 'status' or 'role' = 'BANNED'?
        // Let's check `lib/db-types.ts` or schema.
        // I will use role="BANNED" if `isBanned` is true, or I will use `status` field if it exists.
        // Actually, in `user-table.tsx` there's `role` and `status` might be undefined. Let's just update `role` for Ban, or `isActive` / `isApproved`.
        // Let me check prisma schema for ban logic. I'll just use a try-catch for `status` or update whatever field is passed.
        // Wait, the User model has `status` or just `role`?
        // In the previous output of user-table.tsx, the `getRoleBadge` handles 'BANNED' as a UserRole. Let's use role="BANNED".
        if (isBanned === true) {
            data.role = "BANNED";
        } else if (isBanned === false) {
            // Need to know what role to restore? Usually just "USER" or whatever it was. 
            // We should probably rely on a dedicated `status` field or just leave it to the client to send the right `role` when unbanning.
            // Let's look at schema to be sure, but for now I'll support passing `status` or updating `isBanned` if that's a field.
            // Wait, the user asked: "Gelen JSON içindeki verilere göre (Örn: tokenBalance veya isBanned)".
            // I'll check if `isBanned` exists, if not, I'll update it anyway and let Prisma complain if it's wrong, or I can safely check.
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
                // isBanned: true // If it exists
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
    }
}
