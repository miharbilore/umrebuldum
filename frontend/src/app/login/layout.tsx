import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Giriş Yap veya Kayıt Ol | Umrebuldum",
    description:
        "Umrebuldum hesabınıza giriş yapın veya yeni bir hesap oluşturun. Umre turlarını karşılaştırın, teklif alın ve güvenilir rehberlerle buluşun.",
    openGraph: {
        title: "Giriş Yap veya Kayıt Ol | Umrebuldum",
        description: "Umrebuldum hesabınıza giriş yapın veya yeni bir hesap oluşturun.",
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
