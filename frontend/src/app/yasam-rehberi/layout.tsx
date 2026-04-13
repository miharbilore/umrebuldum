import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Yaşam Rehberi - Umre Pratik Bilgiler",
    description:
        "Kutsal topraklarda günlük yaşamı kolaylaştıracak pratik bilgiler. Alışveriş, uygulamalar, yeme-içme ve sağlık rehberi.",
    keywords: [
        "umre rehber",
        "umre alışveriş",
        "umre uygulamalar",
        "umre yemek",
        "umre sağlık",
        "kutsal topraklar rehber",
    ],
};

export default function YasamRehberiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
