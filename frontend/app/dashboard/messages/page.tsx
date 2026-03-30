"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Lock, Loader2, AlertTriangle, Paperclip, MoreVertical, Phone, Info, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Conversation {
    id: string;
    displayTitle: string;
    displayCounterparty: string;
    lastMessage: string;
    lastMessageTime: string;
}

interface Message {
    id: string;
    senderId: string;
    body: string;
    blocked: boolean;
    createdAt: string;
    role: string;
}

export default function MessagesPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Conversations
    useEffect(() => {
        fetch("/api/chat/conversations")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setConversations(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingConvs(false));
    }, []);

    // Fetch Messages when conversation selected
    useEffect(() => {
        if (!selectedConvId) return;
        setLoadingMsgs(true);
        fetch(`/api/chat/messages/${selectedConvId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                    scrollToBottom();
                }
            })
            .catch(err => toast.error("Mesajlar yüklenemedi"))
            .finally(() => setLoadingMsgs(false));
    }, [selectedConvId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConvId) return;

        setSending(true);
        try {
            const res = await fetch("/api/chat/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: selectedConvId,
                    body: newMessage
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, {
                    ...data,
                    createdAt: new Date().toISOString() // Optimistic update usually, but using API result
                }]);
                setNewMessage("");
                scrollToBottom();
                // Update conversation list last message preview
                setConversations(prev => prev.map(c =>
                    c.id === selectedConvId
                        ? { ...c, lastMessage: data.body, lastMessageTime: new Date().toISOString() }
                        : c
                ));
            } else {
                if (data.blocked) {
                    toast.error("Mesajınız moderasyon takıldı: Uygunsuz içerik.");
                    setMessages(prev => [...prev, {
                        id: "temp-" + Date.now(),
                        senderId: session?.user?.id || "",
                        body: "Mesajınız moderasyon nedeniyle engellendi.",
                        blocked: true,
                        createdAt: new Date().toISOString(),
                        role: session?.user?.role || "USER"
                    }]);
                    scrollToBottom();
                } else {
                    toast.error(data.error || "Mesaj gönderilemedi");
                }
            }
        } catch (error) {
            toast.error("Bir hata oluştu");
        } finally {
            setSending(false);
        }
    };

    if (loadingConvs) return <DashboardLayout><div className="h-[80vh] flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" /><p className="text-gray-500 font-medium">Sohbetler Yükleniyor...</p></div></DashboardLayout>;

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-2 sm:px-4 h-[calc(100vh-80px)]">
                <div className="flex sm:grid sm:grid-cols-1 md:grid-cols-12 gap-0 h-full max-h-[750px] bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">

                    {/* Sidebar */}
                    <div className={cn(
                        "md:col-span-4 lg:col-span-3 border-r flex flex-col bg-slate-50 relative",
                        selectedConvId ? "hidden md:flex w-full" : "flex w-full md:w-auto"
                    )}>
                        <div className="p-4 sm:p-5 border-b bg-white flex justify-between items-center shadow-sm z-10">
                            <h2 className="font-bold text-xl text-gray-800 tracking-tight">Mesajlar</h2>
                            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{conversations.length}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Info className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm">Henüz bir sohbetiniz bulunmuyor.<br />Taleplere teklif vererek mesajlaşmaya başlayabilirsiniz.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {conversations.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConvId(conv.id)}
                                            className={cn(
                                                "w-full text-left p-4 sm:p-5 hover:bg-white transition-all focus:outline-none group relative",
                                                selectedConvId === conv.id ? "bg-white before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-blue-600" : "hover:bg-gray-100/50"
                                            )}
                                        >
                                            <div className="flex gap-3 items-center">
                                                <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
                                                    <AvatarFallback className={cn("text-white font-medium", selectedConvId === conv.id ? "bg-blue-600" : "bg-slate-400")}>{getInitials(conv.displayCounterparty)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <span className="font-semibold text-gray-900 truncate pr-2">
                                                            {conv.displayCounterparty}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap">
                                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-blue-600 font-medium truncate mb-1">
                                                        {conv.displayTitle}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                                                        {conv.lastMessage}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={cn(
                        "md:col-span-8 lg:col-span-9 flex flex-col h-full bg-[#FAF9F6]",
                        !selectedConvId ? "hidden md:flex w-full text-gray-400 bg-slate-50" : "flex w-full"
                    )}>
                        {selectedConvId ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button className="md:hidden text-gray-500 hover:text-gray-700 mr-2" onClick={() => setSelectedConvId(null)}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{getInitials(conversations.find(c => c.id === selectedConvId)?.displayCounterparty || '')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">
                                                {conversations.find(c => c.id === selectedConvId)?.displayCounterparty}
                                            </h3>
                                            <p className="text-xs text-blue-600 font-medium">
                                                {conversations.find(c => c.id === selectedConvId)?.displayTitle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                            <Phone className="w-5 h-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-full hidden sm:inline-flex">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Messages Viewport */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F2F4F7] custom-scrollbar">
                                    {loadingMsgs ? (
                                        <div className="h-full flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
                                    ) : (
                                        <>
                                            <div className="text-center text-xs text-gray-400 font-medium my-4 bg-gray-200/50 inline-block px-3 py-1 rounded-full mx-auto table">
                                                Sohbet Başlangıcı
                                            </div>
                                            {messages.map((msg, idx) => {
                                                const isMe = msg.senderId === session?.user?.id;
                                                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                                                return (
                                                    <div key={msg.id} className={cn("flex w-full group", isMe ? "justify-end" : "justify-start gap-2")}>
                                                        {!isMe && (
                                                            <div className="w-8 shrink-0 flex items-end mb-1">
                                                                {showAvatar && (
                                                                    <Avatar className="h-8 w-8 shadow-sm">
                                                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                                                            {getInitials(conversations.find(c => c.id === selectedConvId)?.displayCounterparty || '')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "max-w-[75%] sm:max-w-[65%] px-4 py-3 text-[15px] shadow-sm relative",
                                                            isMe ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm",
                                                            msg.blocked && "bg-red-50 border-red-200 text-red-600 italic"
                                                        )}>
                                                            {msg.blocked && <AlertTriangle className="w-4 h-4 inline mr-2 text-red-500" />}
                                                            <div className="leading-relaxed whitespace-pre-wrap word-break break-words">
                                                                {msg.body}
                                                            </div>
                                                            <div className={cn("text-[10px] mt-1.5 flex items-center gap-1", isMe ? "text-blue-200 justify-end" : "text-gray-400 justify-start")}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 sm:p-4 bg-white border-t shrink-0">
                                    {session?.user?.role === 'BANNED' ? (
                                        <div className="text-center text-red-600 p-3 bg-red-50 rounded-xl font-medium border border-red-100">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            Hesabınız kısıtlandığı için mesaj gönderemezsiniz.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-blue-600 mb-1 rounded-full hidden sm:inline-flex">
                                                <Paperclip className="w-5 h-5" />
                                            </Button>
                                            <div className="relative flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all overflow-hidden flex items-end">
                                                <textarea
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage(e);
                                                        }
                                                    }}
                                                    placeholder="Bir mesaj yazın..."
                                                    className="w-full max-h-32 min-h-12 bg-transparent resize-none outline-none px-4 py-3 text-[15px] custom-scrollbar"
                                                    disabled={sending}
                                                    rows={1}
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className="shrink-0 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center p-0 mb-0.5"
                                            >
                                                {sending ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white ml-0.5" />}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-24 h-24 bg-white shadow-sm border rounded-full flex items-center justify-center mb-6">
                                    <Send className="w-10 h-10 text-blue-200 ml-1" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Umrebuldum Mesajlar</h3>
                                <p className="text-gray-500 text-center max-w-sm">
                                    Müşterilerinizle iletisim kurmak ve umre taleplerine detaylandırmak için listeden bir sohbet seçin.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Global style for nicer scrollbars in chat */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </DashboardLayout>
    );
}
