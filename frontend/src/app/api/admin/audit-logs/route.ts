import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";

export async function GET(req: Request) {
    try {
        const session = await auth();
        const guard = requireAdmin(session);
        if (guard) return guard;

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);

        // AdminAuditLog tablosu şema temizliğinde kaldırıldığı için
        // frontend'i bozmamak adına boş bir liste (array) dönüyoruz.
        return NextResponse.json({
            logs: [],
            pagination: { 
                page, 
                limit, 
                total: 0, 
                totalPages: 0 
            }
        });
    } catch (error) {
        console.error("Admin audit-logs error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
