'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { 
    Loader2, 
    Edit, 
    Search, 
    MoreHorizontal, 
    Eye, 
    Calendar,
    Users,
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
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import EditListingModal from './EditListingModal';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AllListingsPanel() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data, error, isLoading, mutate } = useSWR(`/api/admin/listings?search=${searchTerm}`, fetcher);
    const [editingListing, setEditingListing] = useState<any | null>(null);

    const listings = data?.listings || [];

    if (error) return (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium">
            Veriler yüklenirken bir hata oluştu. Veritabanı bağlantınızı kontrol edin.
        </div>
    );

    const handleSuccessEdit = () => {
        setEditingListing(null);
        mutate();
    };

    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="border-b bg-white/50 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Tüm İlanlar</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Platformdaki tüm aktif ve pasif tur ilanlarını yönetin.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="İlan başlığı veya rehber..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-sm font-medium text-muted-foreground italic">İlanlar yükleniyor...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Sonuç Bulunamadı</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Aradığınız kriterlere uygun herhangi bir ilan kaydı bulunamadı.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="w-[350px]">Tur Bilgileri</TableHead>
                                    <TableHead>Rehber / Acente</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Ekonomi / Kota</TableHead>
                                    <TableHead className="text-right">İşlem</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listings.map((listing: any) => (
                                    <tr key={listing.id} className="hover:bg-white transition-all group">
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                                    {listing.title}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                                                    <span className="text-gray-300 mx-1">|</span>
                                                    <MapPin className="w-3 h-3" />
                                                    {listing.departureCity || 'Konumsuz'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <SmartAvatar name={listing.guideName} size={32} />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{listing.guideName}</span>
                                                    <span className="text-[10px] text-muted-foreground">{listing.guideEmail}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${listing.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                    <span className={`text-[10px] font-bold ${listing.active ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                        {listing.active ? 'YAYINDA' : 'PASİF'}
                                                    </span>
                                                </div>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`text-[9px] h-4 font-black uppercase tracking-tighter w-fit px-1 ${
                                                        listing.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        listing.approvalStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}
                                                >
                                                    {listing.approvalStatus === 'APPROVED' ? 'Onaylı' : 
                                                     listing.approvalStatus === 'PENDING' ? 'Bekliyor' : 'Reddedildi'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-900 tabular-nums">{listing.price?.toLocaleString('tr-TR')} SAR</span>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                                    <Users className="w-3 h-3" />
                                                    {listing.filled} / {listing.quota}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200">
                                                    <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">İlan Ayarları</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer py-2 px-3"
                                                        onClick={() => setEditingListing(listing)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium">Hızlı Düzenle</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer py-2 px-3">
                                                        <Eye className="mr-2 h-4 w-4 text-emerald-500" />
                                                        <span className="text-sm font-medium">İlanı Görüntüle</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer py-2 px-3 text-destructive hover:bg-red-50 focus:bg-red-50">
                                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                                        <span className="text-sm font-medium">İlanı Pasife Al</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </tr>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {editingListing && (
                <EditListingModal
                    listing={editingListing}
                    onClose={() => setEditingListing(null)}
                    onSuccess={handleSuccessEdit}
                />
            )}
        </Card>
    );
}
