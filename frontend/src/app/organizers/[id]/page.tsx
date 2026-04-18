import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { normalizeSlug } from "@/lib/slug";

const normalizeOrganizerSlug = (slugParam: string) => {
    const [idPart, ...slugParts] = slugParam.split("-");
    if (slugParts.length === 0) {
        return normalizeSlug(slugParam);
    }
    const normalizedTail = normalizeSlug(slugParts.join("-"));
    return normalizedTail ? `${idPart}-${normalizedTail}` : idPart;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: slugParam } = await params;
    const normalizedSlug = normalizeOrganizerSlug(slugParam);
    const canonical = `https://umrebuldum.com/organizers/${normalizedSlug || slugParam}`;

    return {
        title: "Organizatör Profili | Umrebuldum",
        description: "Umrebuldum organizatör profili. Kurumsal acente bilgileri ve tur içerikleri yakında burada olacak.",
        alternates: {
            canonical,
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: "Organizatör Profili | Umrebuldum",
            description: "Umrebuldum organizatör profili. Kurumsal acente bilgileri ve tur içerikleri yakında burada olacak.",
        },
        twitter: {
            card: "summary_large_image",
            title: "Organizatör Profili | Umrebuldum",
            description: "Umrebuldum organizatör profili. Kurumsal acente bilgileri ve tur içerikleri yakında burada olacak.",
        },
    };
}

export default async function OrganizerProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id: slugParam } = await params;
    const normalizedSlug = normalizeOrganizerSlug(slugParam);
    if (normalizedSlug.length > 0 && normalizedSlug !== slugParam) {
        permanentRedirect(`/organizers/${normalizedSlug}`);
    }

    const organizerSchema = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "Umrebuldum Organizatör Profili",
        url: `https://umrebuldum.com/organizers/${normalizedSlug || slugParam}`,
    };

    return (
        <div className="container py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizerSchema) }}
            />
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-gray-200"></div>
                <h1 className="text-2xl font-bold">Organizatör Profili</h1>
                <p className="text-muted-foreground max-w-md">
                    Bu sayfa yapım aşamasındadır. Burada firma bilgileri, diğer turları ve yorumlar listelenecektir.
                </p>
                <Button variant="outline">Geri Dön</Button>
            </div>
        </div>
    )
}
