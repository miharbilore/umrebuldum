import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Umre Turu Detayları";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
    // Note: In edge runtime we can't use prisma directly.
    // Ideally, we'd fetch the tour data from a microservice or public API route.
    // For now, we will construct a beautiful generic/semi-dynamic OG image
    // based on the slug. We extract the readable title from the slug.
    
    // Example slug: "ramazan-umresi-15-gun-2026"
    const readableTitle = params.slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0f172a", // slate-900
                    backgroundImage: "linear-gradient(to bottom right, #0f172a 0%, #1e293b 100%)",
                    fontFamily: "sans-serif",
                    padding: "80px",
                }}
            >
                {/* Decorative Pattern / Badge */}
                <div
                    style={{
                        position: "absolute",
                        top: 40,
                        left: 40,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            backgroundColor: "#FFB800",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            fontWeight: "bold",
                            color: "#000",
                        }}
                    >
                        🕋
                    </div>
                    <span style={{ color: "#fff", fontSize: 24, fontWeight: "bold", letterSpacing: "2px" }}>
                        UMREBULDUM
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                    <div
                        style={{
                            backgroundColor: "rgba(255, 184, 0, 0.2)",
                            color: "#FFB800",
                            padding: "8px 24px",
                            borderRadius: "100px",
                            fontSize: 20,
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "4px",
                            marginBottom: "24px",
                        }}
                    >
                        Özel Umre Turu
                    </div>
                    
                    <h1
                        style={{
                            fontSize: 72,
                            fontWeight: "black",
                            color: "#ffffff",
                            lineHeight: 1.1,
                            margin: "0 0 40px 0",
                            maxWidth: "900px",
                        }}
                    >
                        {readableTitle.length > 50 ? readableTitle.slice(0, 50) + "..." : readableTitle}
                    </h1>

                    <div style={{ display: "flex", gap: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: 24 }}>
                            <span style={{ color: "#FFB800" }}>✓</span> Güvenilir Acenteler
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: 24 }}>
                            <span style={{ color: "#FFB800" }}>✓</span> En İyi Fiyat Garantisi
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: 24 }}>
                            <span style={{ color: "#FFB800" }}>✓</span> 3D Secure Ödeme
                        </div>
                    </div>
                </div>

                {/* Decorative Bottom Bar */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "12px",
                        background: "linear-gradient(90deg, #FFB800 0%, #F59E0B 100%)",
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
