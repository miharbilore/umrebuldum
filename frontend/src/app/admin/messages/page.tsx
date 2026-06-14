import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Mail, Phone, User, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
    const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Mail className="w-8 h-8 text-primary" />
                    İletişim Mesajları
                </h1>
                <p className="text-muted-foreground text-lg">
                    Web sitesindeki İletişim Formu üzerinden gönderilen mesajları buradan inceleyebilirsiniz.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {messages.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Henüz hiç mesaj bulunmuyor.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <Card key={msg.id} className={msg.isRead ? "opacity-75" : "border-primary"}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    {msg.name}
                                </CardTitle>
                                <CardDescription className="flex flex-col gap-1 mt-2">
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {msg.email}
                                    </span>
                                    {msg.phone && (
                                        <span className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> {msg.phone}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {format(new Date(msg.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/50 p-4 rounded-md text-sm leading-relaxed border border-border">
                                    {msg.message}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
