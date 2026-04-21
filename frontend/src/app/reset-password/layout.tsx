import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Şifre Sıfırlama | Umrebuldum",
    description:
        "Umrebuldum hesabınız için yeni bir şifre belirleyin.",
    robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
