'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Trash2, Edit, Plus, X, Check } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ChatbotAdminPanel() {
    const { data: templates, error, isLoading, mutate } = useSWR('/api/admin/chatbot', fetcher);
    const [editingModal, setEditingModal] = useState<boolean>(false);
    const [formData, setFormData] = useState({ id: '', question: '', answer: '', order: 0, isActive: true });

    if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Veriler yüklenirken bir hata oluştu.</div>;

    const handleOpenModal = (t: any = null) => {
        if (t) {
            setFormData({ id: t.id, question: t.question, answer: t.answer, order: t.order, isActive: t.isActive });
        } else {
            setFormData({ id: '', question: '', answer: '', order: 0, isActive: true });
        }
        setEditingModal(true);
    };

    const handleSave = async () => {
        if (!formData.question || !formData.answer) return alert("Soru ve cevap alanları zorunludur.");

        try {
            const method = formData.id ? 'PATCH' : 'POST';
            await fetch('/api/admin/chatbot', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            mutate();
            setEditingModal(false);
        } catch (e) {
            console.error("Save error", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Soru kalıbını silmek istediğinize emin misiniz?")) return;
        try {
            await fetch(`/api/admin/chatbot?id=${id}`, { method: 'DELETE' });
            mutate();
        } catch (e) {
            console.error("Delete error", e);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/admin/chatbot', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !currentStatus }),
            });
            mutate();
        } catch (e) {
            console.error("Status update error", e);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Soru Ekle
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : !templates || templates.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                    <p className="text-gray-400">Henüz sohbet kalıbı eklenmemiş.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {templates.map((t: any) => (
                        <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors hover:border-gray-700">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-md font-mono">Sıra: {t.order}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {t.isActive ? "AKTİF" : "PASİF"}
                                    </span>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-200">{t.question}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{t.answer}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => toggleStatus(t.id, t.isActive)}
                                    className={`p-2 rounded-md transition-colors ${t.isActive ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                        }`}
                                    title={t.isActive ? "Pasife Al" : "Aktifleştir"}
                                >
                                    {t.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleOpenModal(t)}
                                    className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-md transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors"
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
                            <h3 className="font-semibold text-gray-200">
                                {formData.id ? 'Soru Kalıbını Düzenle' : 'Yeni Soru Kalıbı Ekle'}
                            </h3>
                            <button onClick={() => setEditingModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-sm text-gray-300">
                            <div className="space-y-1.5">
                                <label className="font-medium text-gray-400">Soru Başlığı (Kullanıcı Tarafından Seçilecek)</label>
                                <input
                                    type="text"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50 text-white"
                                    placeholder="Örn: Vize işlemleri dahil mi?"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-medium text-gray-400">Cevap (Otomatik Verilecek Yanıt)</label>
                                <textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 min-h-[100px] focus:outline-none focus:border-emerald-500/50 text-white"
                                    placeholder="Örn: Evet, tüm vize işlemleriniz şirketimiz tarafından yürütülmektedir."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-medium text-gray-400">Sıralama</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/50 text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800 bg-gray-800/30">
                            <button
                                onClick={() => setEditingModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
