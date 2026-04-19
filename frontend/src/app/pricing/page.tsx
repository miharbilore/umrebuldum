import { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
    title: 'Paketler ve Alakart Token - Umrebuldum',
    description: 'Umrebuldum platformunda işinizi büyütecek en doğru paketi seçin. Şeffaf fiyatlandırma, zengin özellikler ve sonuç odaklı altyapı.',
    openGraph: {
        title: 'Paketler ve Alakart Token - Umrebuldum',
        description: 'Umrebuldum platformunda işinizi büyütecek en doğru paketi seçin.',
    }
};

export default function PricingPage() {
    return <PricingClient />;
}
