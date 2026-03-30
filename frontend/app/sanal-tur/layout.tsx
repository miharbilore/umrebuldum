import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sanal Tur - Kutsal Toprakları Keşfedin",
    description:
        "Mekke, Medine ve diğer kutsal mekanları interaktif sanal tur ile keşfedin. Mescid-i Haram, Kabe, Mescid-i Nebevi ve daha fazlası.",
    keywords: [
        "sanal tur",
        "Mekke",
        "Medine",
        "Kabe",
        "Mescid-i Haram",
        "Mescid-i Nebevi",
        "kutsal mekanlar",
        "umre ziyaret yerleri",
    ],
};

export default function SanalTurLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
