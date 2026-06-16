import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STOCK_BACKGROUNDS, FRAME_STYLES, FONT_STYLES } from './poster-assets';
import { PosterData } from './types';

interface PosterSettingsFormProps {
    data: PosterData;
    setData: (data: PosterData) => void;
}

export function PosterSettingsForm({ data, setData }: PosterSettingsFormProps) {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-bold text-slate-700">İçerik Düzenleme</Label>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Arka Plan</Label>
                        <select className="w-full text-sm border rounded p-2" value={data.backgroundImage} onChange={e => setData({ ...data, backgroundImage: e.target.value })}>
                            {STOCK_BACKGROUNDS.map(bg => <option key={bg.id} value={bg.id}>{bg.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Çerçeve Stili</Label>
                        <select className="w-full text-sm border rounded p-2" value={data.frameStyle} onChange={e => setData({ ...data, frameStyle: e.target.value })}>
                            {FRAME_STYLES.map(fs => <option key={fs.id} value={fs.id}>{fs.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Yazı Tipi</Label>
                    <select className="w-full text-sm border rounded p-2" value={data.fontStyle} onChange={e => setData({ ...data, fontStyle: e.target.value })}>
                        {FONT_STYLES.map(fs => <option key={fs.id} value={fs.id}>{fs.label}</option>)}
                    </select>
                </div>

                <hr className="my-2" />

                <div>
                    <Label className="text-xs text-slate-500 font-bold">Tur Detayları</Label>
                    <Input className="mt-1" placeholder="Tur Başlığı" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <Label className="text-xs text-slate-500 font-bold">Aciliyet Rozeti (Opsiyonel)</Label>
                        <Input className="mt-1 border-red-200 focus:border-red-500" placeholder="Örn: SON 3 KOLTUK veya ERKEN REZERVASYON" value={data.urgencyText} onChange={e => setData({ ...data, urgencyText: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <Label className="text-xs text-slate-500">4 Kişilik Oda</Label>
                        <Input value={data.price4Person} onChange={e => setData({ ...data, price4Person: e.target.value })} />
                    </div>
                    <div>
                        <Label className="text-xs text-slate-500">3 Kişilik Oda</Label>
                        <Input value={data.price3Person} onChange={e => setData({ ...data, price3Person: e.target.value })} />
                    </div>
                    <div>
                        <Label className="text-xs text-slate-500">2 Kişilik Oda</Label>
                        <Input value={data.price2Person} onChange={e => setData({ ...data, price2Person: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-slate-500">Mekke Otel</Label>
                        <Input value={data.hotelMecca} onChange={e => setData({ ...data, hotelMecca: e.target.value })} />
                    </div>
                    <div>
                        <Label className="text-xs text-slate-500">Medine Otel</Label>
                        <Input value={data.hotelMedina} onChange={e => setData({ ...data, hotelMedina: e.target.value })} />
                    </div>
                </div>

                <hr className="my-2" />

                <div>
                    <Label className="text-xs text-slate-500 font-bold">Rehber ve İletişim</Label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <Input placeholder="Ad Soyad" value={data.guideName} onChange={e => setData({ ...data, guideName: e.target.value })} />
                        <Input placeholder="Telefon" value={data.guidePhone} onChange={e => setData({ ...data, guidePhone: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2 mt-3 p-3 bg-slate-50 rounded-lg border">
                        <input
                            type="checkbox"
                            id="identityVerifiedToggle"
                            className="w-4 h-4 cursor-pointer"
                            checked={data.isIdentityVerified}
                            onChange={e => setData({ ...data, isIdentityVerified: e.target.checked })}
                        />
                        <Label htmlFor="identityVerifiedToggle" className="text-sm cursor-pointer select-none">Kimlik Onaylı Rehber Rozeti Ekle</Label>
                    </div>
                </div>
            </div>
        </div>
    );
}
