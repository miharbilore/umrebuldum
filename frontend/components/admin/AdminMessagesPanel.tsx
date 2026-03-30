"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, X } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminMessagesPanel() {
    const { data: messages, error, isLoading, mutate } = useSWR<any[]>("/api/admin/messages", fetcher);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [viewMessage, setViewMessage] = useState<any>(null);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/messages/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Durum güncellenemedi");

            toast.success("Mesaj durumu güncellendi");
            mutate();
        } catch (err) {
            toast.error("Bir sorun oluştu.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Mesajlar yükleniyor...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Mesajlar yüklenirken bir hata oluştu.</div>;
    }

    return (
        <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-100">Gelen Kutusu</CardTitle>
                    <CardDescription className="text-gray-400">
                        İletişim formu üzerinden gelen en son mesajlar. Okundu olarak işaretlediğinizde sol menüdeki bildirim sayısı azalacaktır.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-800">
                        <Table>
                            <TableHeader className="bg-gray-800/50">
                                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                                    <TableHead className="text-gray-300">Tarih</TableHead>
                                    <TableHead className="text-gray-300">İsim</TableHead>
                                    <TableHead className="text-gray-300">E-posta</TableHead>
                                    <TableHead className="text-gray-300">Telefon</TableHead>
                                    <TableHead className="text-gray-300">Mesaj</TableHead>
                                    <TableHead className="text-gray-300">Durum / İşlem</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!messages || messages.length === 0 ? (
                                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                                        <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                                            Gelen mesaj bulunmuyor.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    messages.map((msg) => (
                                        <TableRow key={msg.id} className="border-gray-800 hover:bg-gray-800/50">
                                            <TableCell className="text-gray-300 whitespace-nowrap">
                                                {format(new Date(msg.createdAt), "dd MMM HH:mm", { locale: tr })}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-200">{msg.name}</TableCell>
                                            <TableCell>
                                                <a href={`mailto:${msg.email}`} className="text-emerald-400 hover:underline">
                                                    {msg.email}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-gray-300">{msg.phone || "-"}</TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate flex-1" title="İçeriği görmek için Oku ikonuna tıklayın">
                                                        {msg.message}
                                                    </span>
                                                    <button
                                                        onClick={() => setViewMessage(msg)}
                                                        className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white shrink-0 transition-colors"
                                                        title="Mesajı Oku"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        defaultValue={msg.status}
                                                        onValueChange={(val) => handleStatusChange(msg.id, val)}
                                                        disabled={updatingId === msg.id}
                                                    >
                                                        <SelectTrigger className={`w-[140px] h-8 text-xs ${msg.status === "NEW" ? "border-red-500/50 text-red-500 bg-red-500/10" :
                                                            msg.status === "READ" ? "border-blue-500/50 text-blue-500 bg-blue-500/10" :
                                                                "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
                                                            }`}>
                                                            {updatingId === msg.id ? (
                                                                <div className="flex items-center justify-center w-full">
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                </div>
                                                            ) : (
                                                                <SelectValue />
                                                            )}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NEW">Okunmadı (Yeni)</SelectItem>
                                                            <SelectItem value="READ">Okundu</SelectItem>
                                                            <SelectItem value="RESOLVED">İşlem Yapıldı</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
                <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-2xl flex flex-col max-h-[85vh] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-10 shrink-0 flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-xl font-semibold text-gray-100">Mesaj Detayı</DialogTitle>
                        <button
                            onClick={() => setViewMessage(null)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors -mr-2"
                            title="Kapat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </DialogHeader>

                    <div className="p-6 overflow-y-auto flex-1 space-y-8">
                        {/* Sender Information Card */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm bg-gray-950 p-5 rounded-xl border border-gray-800 ring-1 ring-white/5 shadow-inner">
                            <div className="space-y-1.5">
                                <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Gönderen</span>
                                <div className="font-semibold text-gray-200 text-[15px]">{viewMessage?.name}</div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Tarih</span>
                                <div className="text-gray-300 text-[15px]">
                                    {viewMessage && format(new Date(viewMessage.createdAt), "dd MMM yyyy, HH:mm", { locale: tr })}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">E-posta</span>
                                <div>
                                    <a href={`mailto:${viewMessage?.email}`} className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium text-[15px] transition-colors">
                                        {viewMessage?.email}
                                    </a>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Telefon</span>
                                <div className="text-gray-300 text-[15px] font-medium tracking-wide">{viewMessage?.phone || "Belirtilmedi"}</div>
                            </div>
                        </div>

                        {/* Message Content Box */}
                        <div className="space-y-3">
                            <span className="text-gray-500 font-medium text-xs uppercase tracking-wider px-1">Mesaj İçeriği</span>
                            <div className="p-5 bg-gray-800/40 rounded-xl border border-gray-800/80 shadow-sm relative group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/10 pointer-events-none rounded-xl" />
                                <p className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed text-[15px] relative z-10">
                                    {viewMessage?.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
