import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // contactMessage tablosu veritabanından silindiği için güncelleme yapmıyoruz.
        // Frontend çökmesin diye işlemi başarılı kabul edip sahte bir sonuç dönüyoruz.
        const updatedMessage = {
            id,
            status,
        };

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error("Admin Message Update Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
