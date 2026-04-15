import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-guards"
import { getRoleConfig } from "@/lib/role-config"
import { safeErrorMessage } from "@/lib/safe-error"

/**
 * POST /api/choose-role
 * Non-admin endpoint: lets a logged-in user pick their role during onboarding.
 * Only works if the user doesn't already have a role.
 */
export async function POST(req: Request) {
    const session = await auth()
    const guard = requireAuth(session)
    if (guard) return guard

    try {
        const { role, name, phone, email: newEmail } = await req.json()

        if (!['USER', 'GUIDE', 'ORGANIZATION'].includes(role)) {
            return NextResponse.json({ error: "Geçersiz rol seçimi" }, { status: 400 })
        }

        if (!phone || phone.trim().length < 7) {
            return NextResponse.json({ error: "Telefon numarası zorunludur" }, { status: 400 })
        }

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "Ad Soyad zorunludur" }, { status: 400 })
        }

        // Find the user — ID is guaranteed non-null after requireAuth
        const user = await prisma.user.findUnique({
            where: { id: session!.user.id! }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Build update data
        const updateData: any = {
            role,
            name: name.trim(),
            phone: phone.trim(),
        }

        // Handle email change (only if user didn't come from OAuth where email is locked)
        if (newEmail && newEmail.trim() !== user.email) {
            // Check if the new email is already taken
            const existingUser = await prisma.user.findUnique({
                where: { email: newEmail.trim() }
            })
            if (existingUser) {
                return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 409 })
            }
            updateData.email = newEmail.trim()
            updateData.emailVerified = null // Force re-verification
        }

        // Transaction: Set all profile fields + create guide-specific data
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: updateData
            })

            if (role === 'GUIDE' || role === 'ORGANIZATION') {
                // Initialize extra profile fields on User directly
                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        fullName: name.trim(),
                        city: "İstanbul"
                    }
                })
            }
        })

        // Note: Tokens are no longer granted here to prevent Freemium Abuse.
        // Guides must complete their profiles and use /api/onboarding/claim-tokens

        return NextResponse.json({ success: true, role })

    } catch (error) {
        console.error("Choose Role Error:", error)
        return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 })
    }
}
