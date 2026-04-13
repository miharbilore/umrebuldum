import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // contactMessage tablosu veritabanından tamamen silindiği için
        // frontend'i (admin paneli mesajlar sayfasını) bozmamak adına boş bir liste dönüyoruz.
        return NextResponse.json([]);
        
    } catch (error) {
        console.error("Admin Messages API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
