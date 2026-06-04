import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const configs = await prisma.creditPackage.findMany({
      orderBy: { sortOrder: "asc" }
    })
    return NextResponse.json(configs)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const data = await req.json()
    const { id, name, slug, priceTRY, credits, monthlyPrice, features, billingPeriod, roleTarget, sortOrder } = data

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

    const updated = await prisma.creditPackage.update({
      where: { id },
      data: {
        name,
        slug,
        priceTRY: Number(priceTRY),
        credits: Number(credits),
        monthlyPrice: Number(monthlyPrice),
        features,
        billingPeriod: Number(billingPeriod),
        roleTarget,
        sortOrder: Number(sortOrder)
      }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const data = await req.json()
    const { name, slug, priceTRY, credits, monthlyPrice, features, billingPeriod, roleTarget, sortOrder } = data

    const created = await prisma.creditPackage.create({
      data: {
        name: name || slug || "Yeni Paket",
        slug: slug || "YENI_PAKET",
        priceTRY: Number(priceTRY) || 0,
        credits: Number(credits) || 0,
        monthlyPrice: Number(monthlyPrice) || 0,
        features: features || {},
        billingPeriod: Number(billingPeriod) || 1,
        roleTarget: roleTarget || "GUIDE",
        sortOrder: Number(sortOrder) || 0
      }
    })
    return NextResponse.json(created)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

    await prisma.creditPackage.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
