'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Phone } from 'lucide-react';
import { CONTACT_WHATSAPP_NUMBER } from '@/lib/constants';
import { usePathname } from 'next/navigation';

function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ChatbotNode {
    id: string;
    question: string;
    answer: string | null;
    _count?: { children: number };
}

interface Message {
    id: string;
    type: 'bot' | 'user';
    text: string;
    options?: { label: string; action: string, data?: any }[];
}

export default function HybridChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const pathname = usePathname();

    const [chatState, setChatState] = useState<'TREE' | 'FREE_CHAT' | 'CONNECTING'>('TREE');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    const WHATSAPP_NUMBER = CONTACT_WHATSAPP_NUMBER;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            initializedRef.current = true;
            startFlow();
        }
        scrollToBottom();
    }, [messages, isOpen]);

    const addBotMessage = (text: string, options?: { label: string; action: string, data?: any }[], delay = 500) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: generateId(),
                type: 'bot',
                text,
                options
            }]);
            setIsTyping(false);
        }, delay);
    };

    const fetchNodes = async (parentId: string | null = null): Promise<ChatbotNode[]> => {
        try {
            const url = parentId ? `/api/chatbot?parentId=${parentId}` : '/api/chatbot';
            const res = await fetch(url);
            return await res.json();
        } catch (error) {
            console.error("Failed to fetch nodes", error);
            return [];
        }
    };

    const startFlow = async () => {
        setMessages([]);
        setIsTyping(true);
        setChatState('TREE');

        const rootNodes = await fetchNodes(null);
        const options: { label: string; action: string; data?: any }[] = rootNodes.map(node => ({
            label: node.question,
            action: 'NODE_CLICK',
            data: node
        }));

        options.push({ label: '💬 Müşteri Temsilcisine Bağlan', action: 'CONNECT_AGENT' });

        setIsTyping(false);
        setMessages([{
            id: generateId(),
            type: 'bot',
            text: 'Selamün Aleyküm, UmreBuldum Asistanı\'na hoş geldiniz. Size nasıl yardımcı olabilirim?',
            options
        }]);
    };

    const isBusinessHours = () => {
        const hour = new Date().getHours();
        return hour >= 9 && hour < 18;
    };

    const handleAction = async (action: string, label: string, data?: any) => {
        setMessages(prev => [...prev, { id: generateId(), type: 'user', text: label }]);

        if (action === 'NODE_CLICK' && data) {
            const node = data as ChatbotNode;
            setIsTyping(true);

            // Fetch children if any
            let children: ChatbotNode[] = [];
            if (node._count && node._count.children > 0) {
                children = await fetchNodes(node.id);
            }

            const options: { label: string; action: string; data?: any }[] = children.map(child => ({
                label: child.question,
                action: 'NODE_CLICK',
                data: child
            }));

            // Always add a way to go back or connect to agent if it's an end node
            if (children.length === 0) {
                options.push({ label: 'Ana Menüye Dön', action: 'MENU_MAIN' });
                options.push({ label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' });
            }

            const responseText = node.answer || "Lütfen aşağıdaki seçeneklerden birini seçin:";
            setIsTyping(false);
            
            setMessages(prev => [...prev, {
                id: generateId(),
                type: 'bot',
                text: responseText,
                options
            }]);

        } else if (action === 'CONNECT_AGENT') {
            setChatState('CONNECTING');
            addBotMessage('Sizi uzman danışmanımıza bağlayabilmemiz için lütfen konuyu kısaca yazar mısınız? (Bu mesaj WhatsApp üzerinden iletilecektir)');
        } else if (action === 'MENU_MAIN') {
            startFlow();
        }
    };

    const triggerWhatsApp = (text: string) => {
        setIsTyping(true);
        setTimeout(() => {
            const isWorkHours = isBusinessHours();
            const wpMessage = `Merhaba, ${text.trim()}`;
            const wpLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(wpMessage)}`;

            const outOfHoursNote = !isWorkHours
                ? '\n\n*(Not: Şu an mesai saatleri dışındayız, ancak mesajınızı bırakırsanız yarın sabah ilk sırada size döneceğiz.)*'
                : '';

            setMessages(prev => [...prev, {
                id: generateId(),
                type: 'bot',
                text: `Anladım. Aşağıdaki butona tıkladığınızda mesajınızla birlikte WhatsApp hattımıza bağlanacaksınız.${outOfHoursNote}`
            }]);

            setMessages(prev => [...prev, {
                id: generateId(),
                type: 'bot',
                text: 'WhatsApp\'a Geçiş',
                options: [
                    { label: '💬 WhatsApp\'ta Devam Et', action: `URL_${wpLink}` },
                    { label: 'Ana Menüye Dön', action: 'MENU_MAIN' }
                ]
            }]);

            setIsTyping(false);
            setChatState('TREE');
        }, 800);
    };

    const handleTextInput = async (text: string) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { id: generateId(), type: 'user', text }]);
        setInputValue('');

        if (chatState === 'CONNECTING') {
            triggerWhatsApp(text);
            return;
        }

        // Free text search in tree
        setIsTyping(true);
        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            const data = await res.json();

            if (data.needsWhatsApp) {
                // Not found, go straight to WP
                setChatState('CONNECTING');
                setMessages(prev => [...prev, {
                    id: generateId(),
                    type: 'bot',
                    text: data.answer || "Sizi müşteri temsilcimize aktarıyorum."
                }]);
                triggerWhatsApp(text);
            } else if (data.node) {
                // Found a node match, simulate node click
                handleAction('NODE_CLICK', `Arama Sonucu: ${data.node.question}`, data.node);
            } else {
                setMessages(prev => [...prev, {
                    id: generateId(),
                    type: 'bot',
                    text: data.answer,
                    options: [
                        { label: 'Ana Menüye Dön', action: 'MENU_MAIN' },
                        { label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' }
                    ]
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: generateId(),
                type: 'bot',
                text: "Bir hata oluştu. Sizi temsilcimize bağlayalım.",
                options: [{ label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' }]
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleOptionClick = (action: string, label: string, data?: any) => {
        if (action.startsWith('URL_')) {
            window.open(action.replace('URL_', ''), '_blank');
        } else {
            handleAction(action, label, data);
        }
    };

    if (pathname?.startsWith("/admin")) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-900 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center relative">
                                <Bot className="w-5 h-5" />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-emerald-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Çözüm Merkezi Asistanı</h3>
                                <p className="text-xs text-white/80">Çevrimiçi</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] flex items-start gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.type === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                        {msg.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${msg.type === 'user' ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>

                                {msg.options && msg.options.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2 ml-8 w-fit max-w-[85%]">
                                        {msg.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(opt.action, opt.label, opt.data)}
                                                className={`text-left text-sm px-4 py-2 rounded-xl transition-colors font-medium border ${opt.action.startsWith('URL_')
                                                    ? 'bg-[#25D366] text-white border-[#25D366] hover:bg-[#1DA851] flex items-center gap-2 justify-center'
                                                    : 'bg-white dark:bg-gray-900 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                    }`}
                                            >
                                                {opt.action.startsWith('URL_') && <Phone className="w-4 h-4" />}
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-1 text-gray-600 dark:text-gray-400">
                                        <Bot className="w-3 h-3" />
                                    </div>
                                    <div className="px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleTextInput(inputValue);
                            }}
                            className="relative flex items-center"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Mesajınızı veya sorunuzu yazın..."
                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white pl-4 pr-5 py-3 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 z-50 group duration-300 animate-bounce [animation-duration:2s] [animation-iteration-count:3]"
                >
                    <span className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping [animation-duration:2s]" />
                        <MessageSquare className="w-5 h-5 relative group-hover:scale-110 transition-transform" />
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap">Canlı Destek</span>
                </button>
            )}
        </div>
    );
}
