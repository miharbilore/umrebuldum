import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Şifremi Unuttum | Umrebuldum",
    description:
        "Umrebuldum hesap şifrenizi sıfırlayın. E-posta adresinize gönderilen bağlantı ile yeni bir şifre belirleyin.",
    robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
