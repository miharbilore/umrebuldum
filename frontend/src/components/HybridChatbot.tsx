'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { MessageSquare, X, Send, Bot, User, Phone } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ChatRole = 'MÜŞTERİ' | 'REHBER' | 'DİĞER' | null;

interface Message {
    id: string;
    type: 'bot' | 'user';
    text: string;
    options?: { label: string; action: string }[];
    isHtml?: boolean;
}

export default function HybridChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // State Machine
    const [chatState, setChatState] = useState<'INIT' | 'CUSTOMER_MENU' | 'GUIDE_MENU' | 'ASK_ISSUE' | 'FREE_CHAT'>('INIT');
    const [userRole, setUserRole] = useState<ChatRole>(null);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);
    const { data: templates } = useSWR('/api/chatbot', fetcher); // For free chat fallback & SSS

    const WHATSAPP_NUMBER = '905551234567'; // Change this appropriately

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

    const addBotMessage = (text: string, options?: { label: string; action: string }[], delay = 500) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'bot',
                text,
                options
            }]);
            setIsTyping(false);
        }, delay);
    };

    const startFlow = () => {
        setMessages([]);
        setIsTyping(true);
        setTimeout(() => {
            setMessages([{
                id: Date.now().toString(),
                type: 'bot',
                text: 'Selamün Aleyküm, UmreBuldum Asistanı\'na hoş geldiniz. Size daha hızlı yardımcı olabilmem için lütfen profilinizi seçin:',
                options: [
                    { label: '🕋 Umre Yolcusuyum / Müşteriyim', action: 'ROLE_CUSTOMER' },
                    { label: '🗂 Rehberim / İlan Vermek İstiyorum', action: 'ROLE_GUIDE' },
                    { label: '❓ Diğer / Bilgi Almak İstiyorum', action: 'ROLE_OTHER' },
                    { label: '📚 Sıkça Sorulan Sorular (SSS)', action: 'ACTION_FAQ' },
                ]
            }]);
            setIsTyping(false);
            setChatState('INIT');
            setUserRole(null);
        }, 500);
    };

    const isBusinessHours = () => {
        const hour = new Date().getHours();
        return hour >= 9 && hour < 18; // 09:00 - 18:00
    };

    const handleAction = async (action: string, label: string) => {
        // Add user selection as a message
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: label }]);

        switch (action) {
            case 'ROLE_CUSTOMER':
                setUserRole('MÜŞTERİ');
                setChatState('CUSTOMER_MENU');
                addBotMessage('Harika! Size nasıl yardımcı olabilirim?', [
                    { label: '🔑 Uygun İlanları Listele', action: 'CUSTOMER_LIST' },
                    { label: '💰 Ödeme ve Taksit Seçenekleri', action: 'CUSTOMER_PAYMENT' },
                    { label: '📄 Vize ve Gerekli Evraklar', action: 'CUSTOMER_VISA' },
                    { label: '👤 Danışmanla Görüşmek İstiyorum', action: 'CONNECT_AGENT' },
                ]);
                break;
            case 'ROLE_GUIDE':
                setUserRole('REHBER');
                setChatState('GUIDE_MENU');
                addBotMessage('Hoş geldiniz hocam. İşleminizi seçin:', [
                    { label: '➕ Yeni İlan Nasıl Verilir?', action: 'GUIDE_NEW' },
                    { label: '✏️ İlanımı Güncellemek İstiyorum', action: 'GUIDE_UPDATE' },
                    { label: '📈 İlanım Neden Onaylanmadı?', action: 'GUIDE_REJECTED' },
                    { label: '👨‍💻 Teknik Destek / Admin', action: 'CONNECT_AGENT' },
                ]);
                break;
            case 'ROLE_OTHER':
                setUserRole('DİĞER');
                setChatState('ASK_ISSUE');
                addBotMessage('Size nasıl yardımcı olabilirim? Lütfen sorunuzu kısaca yazın.');
                break;
            case 'ACTION_FAQ':
                setChatState('FREE_CHAT');
                addBotMessage('Buradayım! Lütfen sorunuzu yazın. Sıkça sorulan sorular veritabanımızdan size yanıt bulmaya çalışacağım. Aksi halde sizi temsilcimize bağlayabilirim.');
                break;

            // Customer Actions
            case 'CUSTOMER_LIST':
                setChatState('ASK_ISSUE');
                setPendingAction('PRICE_INFO');
                addBotMessage('Tabii, size en uygun ilanları bulabilmemiz için hangi tarih aralığı veya bütçeyi düşünüyorsunuz? (Kısaca yazın lütfen)');
                break;
            case 'CUSTOMER_PAYMENT':
                addBotMessage('Ödemelerinizi kredi kartı ile güvenle yapabilir, bankanıza göre değişen 3-6 aya varan taksit seçeneklerinden yararlanabilirsiniz. Satın alım ekranında "Taksit Seçenekleri"ni görebilirsiniz.', [
                    { label: 'Ana Menüye Dön', action: 'MENU_MAIN' },
                    { label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' }
                ]);
                break;
            case 'CUSTOMER_VISA':
                addBotMessage('Umre vizesi için genellikle en az 6 ay geçerli pasaport, biyometrik fotoğraf ve nüfus cüzdanı fotokopisi gereklidir. Vize işlemleri seçtiğiniz acente (rehber) tarafından yönetilmektedir.', [
                    { label: 'Ana Menüye Dön', action: 'MENU_MAIN' },
                    { label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' }
                ]);
                break;

            // Guide Actions
            case 'GUIDE_NEW':
                addBotMessage('Yeni ilan vermek için sağ üstteki "İlan Ver" butonuna tıklayarak tur detaylarınızı girebilirsiniz. Tur tarihlerinizi ve açık, anlaşılır bir açıklama girmeyi unutmayın.', [
                    { label: 'Ana Menüye Dön', action: 'MENU_MAIN' }
                ]);
                break;
            case 'GUIDE_UPDATE':
                addBotMessage('İlanlarınızı güncellemek için Profilinize gidin, "İlanlarım" sekmesinden ilgili ilanı seçip düzenle butonuna tıklayabilirsiniz.', [
                    { label: 'Ana Menüye Dön', action: 'MENU_MAIN' }
                ]);
                break;
            case 'GUIDE_REJECTED':
                addBotMessage('İlanlar genelde eksik bilgi, net olmayan fiyatlandırma veya stok fotoğrafların kurallara uymaması nedeniyle onaylanmaz. Düzenleyip tekrar onaya gönderebilirsiniz.', [
                    { label: 'Ana Menüye Dön', action: 'MENU_MAIN' },
                    { label: 'Teknik Destek', action: 'CONNECT_AGENT' }
                ]);
                break;

            case 'CONNECT_AGENT':
                setChatState('ASK_ISSUE');
                addBotMessage('Sizi uzman danışmanımıza bağlıyorum. Bağlanmadan önce lütfen sorunuzu kısaca yazar mısınız?');
                break;

            case 'MENU_MAIN':
                startFlow();
                break;
            default:
                addBotMessage('Anlaşılmadı, ana menüye dönülüyor...', [
                    { label: 'Ana Menü', action: 'MENU_MAIN' }
                ]);
        }
    };

    const handleTextInput = async (text: string) => {
        if (!text.trim()) return;

        // Add user text
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text }]);
        setInputValue('');

        if (chatState === 'ASK_ISSUE') {
            setIsTyping(true);
            setTimeout(() => {
                const isWorkHours = isBusinessHours();
                let issueType = pendingAction === 'PRICE_INFO' ? 'Fiyat ve İlan Bilgisi' : 'Destek';

                // Construct WP Message
                const wpMessage = `Merhaba, Ben [${userRole || 'Ziyaretçi'}] rolündeyim. [${issueType}] hakkında destek almak istiyorum.%0A%0A*Notum:* ${text.trim()}`;
                const wpLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${wpMessage}`;

                const outOfHoursNote = !isWorkHours
                    ? '\n\n*(Not: Şu an mesai saatleri dışındayız, ancak mesajınızı bırakırsanız yarın sabah ilk sırada size döneceğiz.)*'
                    : '';

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'bot',
                    text: `Anladım. Aşağıdaki butona tıkladığınızda bu mesajınızla birlikte WhatsApp hattımıza bağlanacaksınız.${outOfHoursNote}`
                }]);

                // Show WhatsApp Link Button
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    text: 'WhatsApp\'a Geçiş',
                    options: [
                        { label: '💬 WhatsApp\'ta Devam Et', action: `URL_${wpLink}` },
                        { label: 'Ana Menüye Dön', action: 'MENU_MAIN' }
                    ]
                }]);

                setIsTyping(false);
                setChatState('INIT'); // Reset state
                setPendingAction(null);
            }, 800);
            return;
        }

        if (chatState === 'FREE_CHAT' || chatState === 'INIT') {
            setIsTyping(true);
            try {
                const res = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: text })
                });
                const data = await res.json();

                setMessages((prev) => [...prev, {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    text: data.answer || "Üzgünüm, sorunuzu anlayamadım.",
                    options: [
                        { label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' },
                        { label: 'Başa Dön', action: 'MENU_MAIN' }
                    ]
                }]);
            } catch (error) {
                setMessages((prev) => [...prev, {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    text: "Bir hata oluştu. Sizi temsilcimize bağlayalım.",
                    options: [{ label: 'Temsilciye Bağlan', action: 'CONNECT_AGENT' }]
                }]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const handleOptionClick = (action: string, label: string) => {
        if (action.startsWith('URL_')) {
            window.open(action.replace('URL_', ''), '_blank');
        } else {
            handleAction(action, label);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-900 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
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

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] flex items-start gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.type === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {msg.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${msg.type === 'user'
                                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>

                                {/* Render Options inline below bot messages */}
                                {msg.options && msg.options.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2 ml-8 w-fit max-w-[85%]">
                                        {msg.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(opt.action, opt.label)}
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

                    {/* Input Area */}
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
                                placeholder={chatState === 'ASK_ISSUE' ? "Sorunuzu yazın..." : "Mesajınızı yazın..."}
                                disabled={chatState === 'INIT' || chatState === 'CUSTOMER_MENU' || chatState === 'GUIDE_MENU'} // Force button clicks for menus
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
                    className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 z-50 group duration-300"
                >
                    <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
            )}
        </div>
    );
}
