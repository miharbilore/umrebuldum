'use client';

import { Gavel, Scale, Copyleft, ShieldAlert, CreditCard } from "lucide-react";

export function TermsContent() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="flex justify-between items-center text-xs text-muted-foreground border-b border-border pb-4 mb-8">
                <span>Yürürlük Tarihi: 09 Mart 2026</span>
                <span>Sürüm: 2.1</span>
            </div>

            <h2 className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-blue-600" />
                1. Taraflar ve Kabul
            </h2>
            <p>
                İşbu Kullanım Koşulları ("Sözleşme"), UmreBuldum web sitesini ve mobil uygulamalarını
                ("Platform") ziyaret eden, üye olan veya kullanan tüm gerçek ve tüzel kişiler ("Kullanıcı")
                ile UmreBuldum ("Şirket") arasında bağlayıcıdır. Platformu ziyaret ederek veya "Kabul Ediyorum" seçeneğini işaretleyerek, işbu Sözleşme'deki şartları kabul etmiş sayılırsınız.
            </p>

            <h2>2. Platformun Hukuki Statüsü ve Hizmet Kapsamı</h2>
            <p>
                UmreBuldum, Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında bir <strong>"Aracı Hizmet Sağlayıcı"</strong>dır. Şirketimiz:
            </p>
            <ul>
                <li>Kendisi bir tur operatörü, turizm acentesi veya sağlayıcı <strong>değildir</strong>.</li>
                <li>Sadece Hac ve Umre acentelerinin ("Organizatör/Satıcı") ilanlarını kullanıcılarla ("Alıcı") buluşturan bir pazar yeridir.</li>
                <li>Listelenen turların gerçekleştirilmesi, vize alımı, otel kalitesi ve uçuş rötarları gibi süreçlerde hukuki muhatap <strong>ilân sahibi acentedir</strong>.</li>
                <li>UmreBuldum, satıcıların ilan içerikleri (resimler, vaat edilen oteller) üzerinden garanti vermez, ancak yanıltıcı ilanları tespit ettiğinde derhal sistemden kaldırma yetkisine sahiptir.</li>
            </ul>

            <h2>3. Kayıt ve Hesap Güvenliği</h2>
            <ul>
                <li>Platforma üye olmak için kullanıcıların 18 yaşını doldurmuş ve medeni hakları kullanma ehliyetine sahip olması zorunludur.</li>
                <li>Hesap oluşturulurken verilen tüm kişisel veya kurumsal bilgilerin (Ad, Soyad, TC Kimlik, Vergi No) doğru ve güncel olması kullanıcının yükümlülüğündedir.</li>
                <li>Kullanıcı parolasının güvenliğinden bizzat kendisi sorumludur. Hesabınız üzerinden yapılan işlemlerden (sizin dışınızda biri tarafından yapılsa bile) sizin sorumlu tutulacağınızı unutmayınız.</li>
                <li>Aynı kullanıcı birden fazla sahte hesap (multi-account) açamaz. Tespiti halinde tüm hesaplar askıya alınır.</li>
            </ul>

            <h2>4. Kullanıcının Davranış Yükümlülükleri</h2>
            <p>Platformu kullanan kişi ve kurumlar aşağıdaki eylemlerden kaçınmayı kabul eder:</p>
            <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-3">
                        <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm">Hukuka, kamu düzenine ve genel ahlaka aykırı veya başkalarının telif hakkını ihlal eden içerikler yayınlamak.</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-3">
                        <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm">Otomatik botlar (spider, scraper vb.) kullanarak platformun veri tabanını izinsiz şekilde indekslemek veya kazımak.</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-3">
                        <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm">Sahte siparişler vererek veya sahte puanlama (manipüle yorum) yaparak acentelerin itibarını haksız yere etkilemek.</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-3">
                        <Scale className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm">Platform yazılımını hackleme, SQL Injection, DDOS gibi siber saldırılarda bulunmak, tersine mühendislik yapmak.</p>
                    </div>
                </div>
            </div>

            <h2>5. Fikri Mülkiyet Hakları</h2>
            <p>
                UmreBuldum "U", logo tasarımı, domain, kaynak kodları, yazılım algoritmaları ve platform mimarisinin tamamı dahil olmak üzere her türlü telif, marka hakkı Şirket'e aittir. Kullanıcıların yüklediği yorum ve resimler haricinde kaynak gösterilmeden veya yazılı izin alınmadan alıntı yapılamaz.
            </p>

            <h2>6. Sorumluluğun Sınırlandırılması ve Kesintiler</h2>
            <p>
                Şirket, Platformun 7/24 kesintisiz çalışacağını ve virüs barındırmayacağını %100 garanti etmez. Planlı bakımlar, siber zorbalıklar ve telekomünikasyon altyapısına bağlı zorunlu kesintiler yüzünden doğabilecek veri kayıpları ve iş iptallerinde Şirket sorumlu tutulamaz.
            </p>

            <h2>7. Uyuşmazlık Çözümü</h2>
            <p>
                İşbu Sözleşme'nin uygulanmasından ve yorumlanmasından doğacak uyuşmazlıklarda Türk Hukuku uygulanacaktır. Çözülemeyen uzlaşmazlıklarda yargı yetkisi münhasıran <strong>İstanbul Mahkemeleri ve İcra Dairelerine</strong> aittir. Tüketici sıfatını haiz müşteriler, uyuşmazlık durumunda yasal sınırları içerisindeki Tüketici Hakem Heyetleri'ne başvuruda bulunabilirler.
            </p>
        </div>
    );
}

export function RefundPolicyContent() {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8 items-stretch">
                {/* Umrebuldum Üyelik ve Kredi Paketleri */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold m-0">Abonelik ve Paket İadesi</h2>
                    </div>

                    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none mb-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">Bu bölüm, platformumuzda kredi/token ve abonelik paketi satın alan acentelerimizi kapsar.</p>
                        
                        <h3>1. 14 Günlük Cayma Hakkı</h3>
                        <p>Satın alınan hizmet henüz hiç kullanılmamışsa (ilan yayınlanmamış ve öne çıkarma başlamamışsa), 14 gün içerisinde kesintisiz iade talep edilebilir.</p>

                        <h3>2. Kullanılmış Hizmetlerde İade</h3>
                        <p>Abonelik başlatıldıktan veya tokenlar kısmen kullanıldıktan sonra Cayma Hakkı kullanılamaz ve <strong>kısmi iade yapılmaz.</strong></p>

                        <h3>3. Kuralların İhlali</h3>
                        <p>Dolandırıcılık teşebbüsü veya şart ihlali nedeniyle kapatılan hesapların bakiyesi iade edilmez.</p>
                    </div>
                </div>

                {/* Tur Paketleri Sorumluluk Reddi */}
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-6 border-b border-red-100 dark:border-red-900/30 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold m-0 text-red-900 dark:text-red-400">Tur Paketi İptalleri</h2>
                    </div>

                    <div className="prose prose-red dark:prose-invert prose-sm max-w-none">
                        <div className="p-3 bg-white dark:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/50 shadow-sm mb-4">
                            <h3 className="font-bold text-red-900 dark:text-red-400 text-sm mt-0">Sorumluluk Reddi</h3>
                            <p className="text-xs mb-0">Umrebuldum bir aracı kurumdur. <strong>Tur paketlerinin satıcısı veya düzenleyicisi değiliz.</strong></p>
                        </div>

                        <h3>1. Sözleşmenin Tarafları</h3>
                        <p>Satın aldığınız turların tüm yasal ve finansal sorumluluğu tamamen <strong>rezervasyonu yaptığınız Acente</strong> ile sizin aranızdadır.</p>

                        <h3>2. Ödemeler ve Şikayetler</h3>
                        <p>Tur ücreti platformumuz üzerinden değil, doğrudan acenteye ödenir. Bu nedenle iade ve tazminat süreçlerinde <strong>Umrebuldum sorumlu veya garantör değildir.</strong></p>

                        <h3>3. İptal Süreçleri</h3>
                        <p>İptal ve iade talepleriniz için kayıt olduğunuz Acentenin kendi "TÜRSAB Mesafeli Satış Sözleşmesi" geçerlidir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
