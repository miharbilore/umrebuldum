import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api-guards"
import { logAdminAction } from "@/lib/admin-audit"
import { grantToken } from "@/modules/tokens/application/grant-token.usecase"
import { UserRole } from "@prisma/client"

/**
 * ADMIN-ONLY: Set a user's role.
 * Users cannot change their own role.
 */
export async function POST(req: Request) {
    const session = await auth()
    const guard = requireAdmin(session)
    if (guard) return guard

    try {
        const { targetUserId, role } = await req.json()

        if (!targetUserId) {
            return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })
        }

        if (![UserRole.USER, UserRole.GUIDE, UserRole.ORGANIZATION].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId }
        })
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        if (targetUser.role === role) {
            return NextResponse.json({ error: "User already has this role" }, { status: 400 })
        }

        // Update role
        await prisma.user.update({
            where: { id: targetUserId },
            data: { role }
        })

        // Initialize GuideProfile if switching to GUIDE/ORG
        if (role === 'GUIDE' || role === 'ORGANIZATION') {
            const existing = await prisma.guideProfile.findUnique({
                where: { userId: targetUserId }
            })

            if (!existing) {
                await prisma.guideProfile.create({
                    data: {
                        userId: targetUserId,
                        quotaTarget: 100,
                        currentCount: 0,
                    }
                })

                // Write initial tokens to unified ledger
                await grantToken({
                    userId: targetUserId,
                    amount: 30,
                    type: "ADMIN_GRANT",
                    reason: "Initial signup credits (admin role assignment)",
                    idempotencyKey: `set-role-grant:${targetUserId}`,
                })
            }
        }

        // Audit log
        const adminUser = await prisma.user.findUnique({
            where: { email: session!.user.email! }
        })
        if (adminUser) {
            await logAdminAction(
                adminUser.id,
                "set_role",
                targetUserId,
                `Role changed to ${role}`,
                { previousRole: targetUser.role, newRole: role }
            )
        }

        return NextResponse.json({
            success: true,
            role,
            message: `User ${targetUserId} role set to ${role}`
        })

    } catch (error) {
        console.error("Set Role Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
