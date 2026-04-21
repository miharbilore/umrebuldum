import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Umre Teklifi Al | Umrebuldum",
    description:
        "Umre yolculuğunuz için size özel teklif alın. Kalkış şehri, tarih ve bütçenizi belirleyin, güvenilir rehberlerden teklif bekleyin.",
    openGraph: {
        title: "Umre Teklifi Al | Umrebuldum",
        description:
            "Kalkış şehri, tarih ve bütçenizi belirleyin, güvenilir rehberlerden teklif bekleyin.",
    },
};

export default function RequestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
