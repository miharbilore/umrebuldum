'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { 
    CheckCircle, 
    XCircle, 
    Loader2, 
    AlertTriangle, 
    Search,
    MapPin,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface PendingListing {
    id: string;
    title: string;
    guideName: string;
    guideEmail: string;
    price: number;
    createdAt: string;
    trustScore: number;
    isFeatured: boolean;
    departureCity: string;
    city: string;
}

export default function PendingListingsPanel() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/pending-listings', fetcher);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ listingId: string; title: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    async function handleApprove(listingId: string) {
        setActionLoading(listingId);
        try {
            const res = await fetch('/api/admin/approve-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, action: 'APPROVE', reason: 'Admin onayladı' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Onay başarısız');
            toast.success("İlan başarıyla onaylandı ve yayına alındı.");
            mutate();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleReject() {
        if (!rejectModal || !rejectReason.trim()) return;
        setActionLoading(rejectModal.listingId);
        try {
            const res = await fetch('/api/admin/reject-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: rejectModal.listingId, reason: rejectReason.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Red başarısız');
            toast.success("İlan reddedildi.");
            setRejectModal(null);
            setRejectReason('');
            mutate();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground font-medium">İlanlar taranıyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                    <h4 className="font-bold text-destructive">Bağlantı Hatası</h4>
                    <p className="text-sm text-destructive/80 italic">Veritabanı ile iletişim kurulurken bir sorun oluştu.</p>
                </div>
                <Button variant="outline" className="ml-auto" onClick={() => mutate()}>Yeniden Dene</Button>
            </div>
        );
    }

    const listings: PendingListing[] = data?.listings || [];

    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="border-b bg-white/50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            Onay Bekleyen İlanlar
                            <Badge variant="secondary" className="rounded-full px-2 py-0">
                                {listings.length}
                            </Badge>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Yayınlanmadan önce admin incelemesi gereken yeni tur ilanları.</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {listings.length === 0 ? (
                    <div className="text-center py-20 bg-white/20">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Hepsi Temiz!</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Bekleyen herhangi bir ilan kalmadı. Tüm talepler işlendi.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="w-[300px]">İlan Başlığı / Güzergah</TableHead>
                                    <TableHead>Rehber Bilgileri</TableHead>
                                    <TableHead>Ekonomik Veri</TableHead>
                                    <TableHead>Gönderim</TableHead>
                                    <TableHead className="text-right">Aksiyon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-white transition-all group">
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                                    {listing.title}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Badge variant="outline" className="px-1.5 py-0 border-gray-200 bg-gray-50 uppercase text-[10px]">
                                                        {listing.departureCity}
                                                    </Badge>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    <Badge variant="outline" className="px-1.5 py-0 border-gray-200 bg-gray-50 uppercase text-[10px]">
                                                        {listing.city}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <SmartAvatar name={listing.guideName} size={32} />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{listing.guideName}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${listing.trustScore >= 70 ? 'bg-success' : 'bg-warning'}`} />
                                                        <span className="text-[10px] text-muted-foreground">Güven: %{listing.trustScore}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-900 tabular-nums">
                                                    {listing.price?.toLocaleString('tr-TR')} SAR
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">4 Kişilik Fiyat</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {new Date(listing.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">Tarihinde İletildi</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-success/30 text-success hover:bg-success hover:text-white transition-all font-semibold"
                                                    onClick={() => handleApprove(listing.id)}
                                                    disabled={actionLoading === listing.id}
                                                >
                                                    {actionLoading === listing.id ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <CheckCircle className="w-3 h-3 mr-1.5" />}
                                                    Onayla
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all font-semibold"
                                                    onClick={() => setRejectModal({ listingId: listing.id, title: listing.title })}
                                                    disabled={actionLoading === listing.id}
                                                >
                                                    <XCircle className="w-3 h-3 mr-1.5" />
                                                    Red
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </tr>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Reject Reason Modal - Using a simple overlay or shadcn Dialog if available, 
                let's keep the user's logic but update the UI */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in transition-all">
                    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">İlanı Reddet</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Lütfen rehbere iletilmek üzere nedenini belirtin.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 italic text-xs text-gray-600">
                                "{rejectModal.title}"
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Red Sebebi <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Örn: Görseller uygunsuz, fiyat bilgisi hatalı..."
                                    rows={3}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                    className="text-gray-500 hover:bg-gray-100"
                                >
                                    İptal
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={!rejectReason.trim() || actionLoading === rejectModal.listingId}
                                    className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                                >
                                    {actionLoading === rejectModal.listingId && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    İlanı Reddet
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
