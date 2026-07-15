import jsPDF from 'jspdf';
import type { Prisma } from '@/../prisma/generated-client';

type ListingWithDetails = Prisma.GuideListingGetPayload<{}> & {
    guide?: { fullName?: string | null; name?: string | null };
    tourPlan?: unknown;
    extraServices?: unknown;
    pricing?: unknown;
};

let robotoBase64Cache: string | null = null;

async function fetchRobotoBase64(): Promise<string> {
    if (robotoBase64Cache) return robotoBase64Cache;
    const url = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Font load failed");
    
    const buffer = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    robotoBase64Cache = window.btoa(binary);
    return robotoBase64Cache;
}

export const generatePDF = async (listing: ListingWithDetails) => {
    const doc = new jsPDF();
    
    // Register Roboto Font for Turkish characters support
    try {
        const fontBase64 = await fetchRobotoBase64();
        doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');
    } catch (fontError) {
        console.warn("Could not load custom font, falling back to default Helvetica:", fontError);
        doc.setFont('Helvetica');
    }

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 100); // Dark Blue
    doc.text(listing.title, 20, 20);

    // Guide Info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Rehber: ${listing.guide?.fullName || 'Belirtilmemiş'}`, 20, 30);

    // Safely format date
    const dateStr = listing.startDate ? new Date(listing.startDate).toLocaleDateString('tr-TR') : 'Tarih Belirtilmemiş';
    doc.text(`Tarih: ${dateStr} - ${listing.totalDays || 0} Gün`, 20, 36);

    // Line
    doc.setDrawColor(200);
    doc.line(20, 42, pageWidth - 20, 42);

    // Content
    let y = 55;

    // Tour Plan
    if (Array.isArray(listing.tourPlan) && listing.tourPlan.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("Tur Programı", 20, y);
        y += 10;

        const planDays = Array.isArray(listing.tourPlan) ? listing.tourPlan as unknown as { day: number; city: string; description: string }[] : [];

        planDays.forEach((day) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(200, 100, 0); // Orange/Amber
            doc.text(`${day.day}. Gün - ${day.city}`, 20, y);
            y += 7;

            doc.setFontSize(11);
            doc.setTextColor(60);

            // Text wrap
            const splitText = doc.splitTextToSize(day.description, pageWidth - 40);
            doc.text(splitText, 20, y);

            y += (splitText.length * 5) + 8;
        });
    } else {
        doc.setFontSize(12);
        doc.text("Detaylı program bilgisi girilmemiştir.", 20, y);
        doc.text(listing.description || "", 20, y + 10, { maxWidth: pageWidth - 40 });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`UmreBuldum - ${listing.title}`, 20, 290);
        doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth - 30, 290);
    }

    doc.save(`tur-programi-${listing.id}.pdf`);
};
