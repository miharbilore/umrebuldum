const mapsData = [
    {
        mapId: 'saudi_main',
        backgroundImage: '/images/saudi_main.png',
        pins: [
            { 
                id: 'medina', 
                x_percent: 42.5, 
                y_percent: 36.5, 
                type: 'zoom_map', 
                targetMap: 'medina_detail'
            },
            { 
                id: 'mecca', 
                x_percent: 48.5, 
                y_percent: 54.5, 
                type: 'zoom_map', 
                targetMap: 'mecca_detail'
            },
            { 
                id: 'riyad', 
                x_percent: 66.0, 
                y_percent: 51.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">Başkent</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Riyad</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Gelenek ile geleceğin buluşma noktası.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Suudi Arabistan'ın siyasi, finansal ve idari başkenti olan Riyad, görkemli gökdelenleri, tarihi Masmak Kalesi ve modern yaşam alanlarıyla krallığın vizyonunu yansıtır.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'jeddah', 
                x_percent: 31.0, 
                y_percent: 48.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 text-xs font-semibold rounded mb-2">Kıyı Şehri</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Cidde</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Kızıldeniz'in incisi ve Haremeyn'in ana kapısı.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Tarihi El-Beled bölgesi UNESCO miras listesindedir. Hac ve Umre yolcularının büyük çoğunluğu Cidde Kral Abdulaziz Havalimanı üzerinden kutsal topraklara giriş yapar.</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <h5 class="text-xs font-bold text-slate-800 uppercase mb-2">Önemli Noktalar</h5>
                        <ul class="text-sm text-slate-600 space-y-1">
                            <li class="flex items-start"><span class="text-cyan-500 mr-2">✓</span> Tarihi El-Beled Evleri</li>
                            <li class="flex items-start"><span class="text-cyan-500 mr-2">✓</span> Cidde Kornişi (Sahil)</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'al_ula', 
                x_percent: 33.5, 
                y_percent: 29.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded mb-2">Tarihi Miras</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Al-Ula</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Zamanın durduğu antik kent.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Nebati Krallığı'na başkentlik yapmış tarihi Madain Saleh (Hegra) bu bölgededir. Devasa kayalara oyulmuş anıt mezarlarıyla dünyanın en etkileyici açık hava müzelerinden biridir.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'neom', 
                x_percent: 30.5, 
                y_percent: 21.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded mb-2">Mega Proje</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Neom / The Line</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Geleceğin sürdürülebilir yaşam alanı.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Suudi Arabistan'ın 2030 Vizyonu kapsamında inşa edilen; karbon sıfır, yapay zeka destekli, arabasız ve ekolojik dev akıllı şehir projesidir.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'taif', 
                x_percent: 49.5, 
                y_percent: 62.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded mb-2">Doğa & Tarih</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Taif</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Güllerin ve serin yaylaların şehri.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Peygamber Efendimiz'in (SAV) İslam'ı tebliğ için gidip taşlandığı, meleklerin yardıma geldiği ancak onun rahmetle dua ettiği tarihi ve iklimiyle ünlü önemli bir şehirdir.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'dogu_bolgesi', 
                x_percent: 78.5, 
                y_percent: 32.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded mb-2">Sanayi & Ticaret</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Doğu Bölgesi</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Dammam ve Khobar Bölgesi.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Basra Körfezi'ne kıyısı olan bu bölge, Suudi Arabistan'ın petrol üretim merkezi olup gelişmiş altyapısı ve uzun sahil şeritleriyle dikkat çeker.</p>
                    </div>
                </div>` 
            }
        ]
    },
    {
        mapId: 'medina_detail',
        backgroundImage: '/images/medine_detail.png',
        pins: [
            { 
                id: 'mescid_i_nebevi', 
                x_percent: 57.5, 
                y_percent: 47.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded mb-2">Kutsal Mekan</span>
                    <h4 class="text-2xl font-bold text-slate-800 mb-1">Mescid-i Nebevi</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Peygamber Efendimiz'in (SAV) kabrinin bulunduğu mukaddes mescit.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>İslam'ın ikinci en kutsal mescidi olan Mescid-i Nebevi, Hz. Muhammed'in Medine'ye hicretinden sonra inşa edilmiştir. Cennet bahçelerinden bir bahçe olan <strong>Ravza-i Mutahhara</strong> burada bulunur.</p>
                    </div>
                    <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <h5 class="text-xs font-bold text-emerald-800 uppercase mb-2">Ziyaret Adabı</h5>
                        <ul class="text-sm text-emerald-700 space-y-1">
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">✓</span> İki rekat Tahiyyetü'l Mescid namazı kılınır</li>
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">✓</span> Hz. Peygamber ve Sahabelerine selam verilir</li>
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">✓</span> Mescid içinde sükunet muhafaza edilir</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'cennetul_baki', 
                x_percent: 86.5, 
                y_percent: 51.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded mb-2">Tarihi Mekan</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Cennetü'l-Baki Mezarlığı</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Medine'nin en köklü ve feyizli kabristanı.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Peygamber Efendimiz'in (SAV) ailesinin, sahabelerinin ve binlerce İslam aliminin metfun bulunduğu tarihi kabristandır. Sabah ve ikindi namazlarından sonra ziyarete açıktır.</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <h5 class="text-xs font-bold text-slate-800 uppercase mb-2">Ziyaret Kuralları</h5>
                        <ul class="text-sm text-slate-600 space-y-1">
                            <li class="flex items-start"><span class="text-slate-500 mr-2">✓</span> Dualar ve Fatihalar uzaktan okunur</li>
                            <li class="flex items-start"><span class="text-slate-500 mr-2">✓</span> Sadece belirlenmiş saatlerde giriş yapılabilir</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'kuba_mescidi', 
                x_percent: 74.5, 
                y_percent: 78.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded mb-2">Kutsal Mekan</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Kuba Mescidi</h4>
                    <p class="text-sm italic text-slate-500 mb-3">İslam tarihindeki ilk mescit.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hz. Muhammed'in (SAV) hicret yolculuğu sırasında yaptırdığı ve içinde namaz kıldığı ilk mescittir. Peygamberimiz burayı genellikle Cumartesi günleri ziyaret ederdi.</p>
                    </div>
                    <div class="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <h5 class="text-xs font-bold text-amber-800 uppercase mb-2">Önemli Sünnet</h5>
                        <ul class="text-sm text-amber-700 space-y-1">
                            <li class="flex items-start"><span class="text-amber-500 mr-2">★</span> Evinde abdest alıp Kuba'da namaz kılana Umre sevabı vardır.</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'yedi_camiler', 
                x_percent: 49.0, 
                y_percent: 29.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded mb-2">Savaş Alanı</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Yedi Camiler (Hendek)</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Hendek Savaşı'nın izlerini taşıyan mukaddes tepe.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Selman-ı Farisi'nin (r.a.) önerisiyle kazılan hendeklerin bulunduğu ve sahabelerin çadır kurduğu yerlere sonradan yapılan küçük mescitler topluluğudur.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'mescid_i_kibleteyn', 
                x_percent: 29.5, 
                y_percent: 30.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded mb-2">Tarihi Mekan</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Mescid-i Kıbleteyn</h4>
                    <p class="text-sm italic text-slate-500 mb-3">İki Kıbleli Mescit.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hz. Peygamber öğle namazını kıldırırken gelen vahiy üzerine, namazı bozmadan Kudüs (Mescid-i Aksa) yönünden Kabe yönüne döndüğü ve cemaatin de onunla döndüğü tarihi mescittir.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'zulhuleyfe', 
                x_percent: 21.5, 
                y_percent: 75.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">Mikat Sınırı</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Zülhuleyfe Mikat Mescidi</h4>
                    <p class="text-sm italic text-slate-500 mb-3">İhrama girilen mihenk taşı.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Medine'den Mekke'ye Umre veya Hac için gidenlerin ihrama girmek zorunda oldukları mikat sınırıdır (Şecere Camii olarak da bilinir).</p>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h5 class="text-xs font-bold text-blue-800 uppercase mb-2">İhram Sünnetleri</h5>
                        <ul class="text-sm text-blue-700 space-y-1">
                            <li class="flex items-start"><span class="text-blue-500 mr-2">✓</span> Gusül abdesti alınır</li>
                            <li class="flex items-start"><span class="text-blue-500 mr-2">✓</span> İki rekat ihram namazı kılınır</li>
                            <li class="flex items-start"><span class="text-blue-500 mr-2">✓</span> Telbiye duasına başlanır</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'uhud', 
                x_percent: 71.0, 
                y_percent: 18.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded mb-2">Savaş Alanı</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Uhud Dağı ve Şehitliği</h4>
                    <p class="text-sm italic text-slate-500 mb-3">"Uhud bizi sever, biz Uhud'u severiz."</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Uhud Savaşı'nın gerçekleştiği alandır. Hz. Hamza başta olmak üzere 70 sahabenin şehit düşüp defnedildiği Uhud Şehitliği ile meşhur Okçular Tepesi (Ayneyn) bu bölgededir.</p>
                    </div>
                    <div class="bg-red-50 p-3 rounded-lg border border-red-100">
                        <h5 class="text-xs font-bold text-red-800 uppercase mb-2">Ziyaret Noktaları</h5>
                        <ul class="text-sm text-red-700 space-y-1">
                            <li class="flex items-start"><span class="text-red-500 mr-2">✓</span> Okçular Tepesi'ne çıkış</li>
                            <li class="flex items-start"><span class="text-red-500 mr-2">✓</span> Hz. Hamza ve şehitlerin kabirlerini selamlama</li>
                        </ul>
                    </div>
                </div>` 
            }
        ]
    },
    {
        mapId: 'mecca_detail',
        backgroundImage: '/images/mecca_detail.png',
        pins: [
            { 
                id: 'masjid_al_haram', 
                x_percent: 52.0, 
                y_percent: 55.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded mb-2">Kutsal Mekan</span>
                    <h4 class="text-2xl font-bold text-slate-800 mb-1">Mescid-i Haram & Kabe</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Yeryüzündeki ilk mabet ve İslam'ın kıblesi.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Ortasında Kabe-i Muazzama'nın bulunduğu, yeryüzünün en kutsal mescididir. Umre ve Hac ibadetinin temel rüknü olan Tavaf burada gerçekleştirilir.</p>
                    </div>
                    <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <h5 class="text-xs font-bold text-emerald-800 uppercase mb-2">Tavaf Adımları</h5>
                        <ul class="text-sm text-emerald-700 space-y-1">
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">1.</span> Hacer-ül Esved köşesinden başlanır</li>
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">2.</span> Kabe etrafında 7 şavt dönülür</li>
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">3.</span> Makam-ı İbrahim arkasında namaz kılınır</li>
                            <li class="flex items-start"><span class="text-emerald-500 mr-2">4.</span> Kana kana Zemzem içilir</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'safa_merve', 
                x_percent: 73.0, 
                y_percent: 44.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded mb-2">Kutsal Alan</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Safa ve Merve</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Sa'y ibadetinin gerçekleştirildiği tepeler.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hz. Hacer'in oğlu İsmail için su ararken bu iki tepe arasında koşuşunu temsil eden Sa'y ibadeti, günümüzde Mescid-i Haram içine katılmış olan klimalı ve kapalı bu alanda yapılır.</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <h5 class="text-xs font-bold text-slate-800 uppercase mb-2">Sa'y İşlemi</h5>
                        <ul class="text-sm text-slate-600 space-y-1">
                            <li class="flex items-start"><span class="text-slate-500 mr-2">✓</span> Safa'dan başlanır, Merve'de biter</li>
                            <li class="flex items-start"><span class="text-slate-500 mr-2">✓</span> Toplam 7 gidiş-geliş (şavt) yapılır</li>
                        </ul>
                    </div>
                </div>` 
            },
            { 
                id: 'cebeli_nur', 
                x_percent: 84.5, 
                y_percent: 21.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded mb-2">Vahiy Dağı</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Cebel-i Nur (Hira Mağarası)</h4>
                    <p class="text-sm italic text-slate-500 mb-3">İlk vahyin "Oku" (İkra) emrinin indiği dağ.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hz. Muhammed'in (SAV) peygamberlik öncesi inzivaya çekildiği Hira Mağarası'nın bulunduğu sarp ve yüksek dağdır. Ziyaretçiler merdivenli patikadan zirveye çıkabilmektedir.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'mina', 
                x_percent: 49.5, 
                y_percent: 7.0, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded mb-2">Hac Bölgesi</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Mina (Çadır Kent)</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Dünyanın en büyük geçici yerleşim alanı.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hac günlerinde milyonlarca hacının ateş geçirmez klimalı çadırlarda konakladığı, Cemerat adı verilen "Şeytan Taşlama" alanlarının bulunduğu düzlüktür.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'muzdelife', 
                x_percent: 51.5, 
                y_percent: 21.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">Hac Bölgesi</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Müzdelife</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Gece vakfesinin yapıldığı düzlük.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Arafat dönüşü hacı adaylarının geceyi açıkhavada geçirdikleri ve şeytan taşlamak için sembolik küçük taşları topladıkları kutsal alandır.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'arafat', 
                x_percent: 85.0, 
                y_percent: 81.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded mb-2">Hac Bölgesi</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Arafat & Cebel-i Rahme</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Haccın en büyük farzının yapıldığı meydan.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hz. Adem ile Hz. Havva'nın dünyada buluştuğu ve Hz. Muhammed'in (SAV) Veda Hutbesi'ni irad ettiği Cebel-i Rahme (Rahmet Dağı) tepesini de barındıran kutsal vakfe alanıdır.</p>
                    </div>
                </div>` 
            },
            { 
                id: 'mescid_i_cin', 
                x_percent: 22.0, 
                y_percent: 79.5, 
                type: 'info', 
                content: `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded mb-2">Tarihi Mekan</span>
                    <h4 class="text-xl font-bold text-slate-800 mb-1">Mescid-i Cin</h4>
                    <p class="text-sm italic text-slate-500 mb-3">Cin suresinin nüzulüne şahitlik eden yer.</p>
                    <div class="text-sm text-slate-700 space-y-2 mb-4">
                        <p>Hz. Muhammed'in (SAV) cinlerden bir gruba Kur'an okuduğu ve onların Müslüman olduğu mevkide inşa edilmiş tarihi mescittir.</p>
                    </div>
                </div>` 
            }
        ]
    }
];

module.exports = mapsData;
