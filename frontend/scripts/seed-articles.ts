import { PrismaClient } from '../prisma/generated-client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Recovery: Guide Articles...');

  const articles = [
    {
      slug: 'umre-yasam-rehberi',
      title: 'Kutsal Topraklarda Yaşam Rehberi: Pratik İpuçları',
      excerpt: 'Mekke ve Medine\'de günlük hayatı kolaylaştıracak alışveriş, yeme-içme, sağlık ve teknoloji rehberi.',
      category: 'YASAM',
      coverImage: '/images/rehber/yasam.jpg',
      content: `
        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-slate-900 mb-4">🏠 Kutsal Topraklarda Günlük Yaşam</h2>
            <p>Umre yolculuğu sadece ibadetten ibaret değildir; aynı zamanda farklı bir iklim ve kültürde yaşamayı gerektirir. Bu rehber, Mekke ve Medine'deki hayatınızı kolaylaştıracak pratik bilgiler sunar.</p>
          </section>

          <section class="bg-blue-50 p-6 rounded-2xl">
            <h3 class="text-xl font-bold text-blue-900 mb-4">📱 Hayat Kurtaran Dijital Uygulamalar</h3>
            <ul class="space-y-3">
              <li><strong>Nusuk:</strong> Umre randevusu ve Ravza-i Mutahhara ziyareti için zorunludur.</li>
              <li><strong>Careem / Uber:</strong> Şehir içi ulaşım için en güvenilir ve sabit fiyatlı yöntemdir.</li>
              <li><strong>HungerStation / Jahez:</strong> Otelinize yemek siparişi vermek için kullanılır.</li>
              <li><strong>Google Maps:</strong> Özellikle Mescid-i Haram çevresindeki kapıları ve mekanları bulmak için hayati önem taşır.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-bold text-slate-900 mb-4">🛍️ Alışveriş ve Ekonomi</h3>
            <p>Suudi Arabistan'da alışveriş kültürü geniştir. Bin Dawood ve Panda gibi büyük marketler sabit fiyatlıdır; ancak çarşılarda pazarlık yapmak esastır.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="p-4 border border-slate-200 rounded-xl">
                <h4 class="font-bold">Mekke</h4>
                <p>Zemzem Towers, Safwa Market ve Aziziyah bölgesi tekstil ve hediyelik için uygundur.</p>
              </div>
              <div class="p-4 border border-slate-200 rounded-xl">
                <h4 class="font-bold">Medine</h4>
                <p>Eski Hurma Pazarı ve Mescid-i Nebevi çevresindeki çarşılar en popüler noktalardır.</p>
              </div>
            </div>
          </section>

          <section class="bg-emerald-50 p-6 rounded-2xl">
            <h3 class="text-xl font-bold text-emerald-900 mb-4">🍽️ Yeme-İçme Kültürü</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Al Baik:</strong> Suudi Arabistan'ın sembolleşmiş tavuk restoranı.</li>
              <li><strong>Mandi / Kabsa:</strong> Kırmızı et ve pilavın en lezzetli hali.</li>
              <li><strong>Zemzem:</strong> Sürekli yanınızda boş bir matara bulundurun, Mescid içindeki termaslar her zaman tazedir.</li>
              <li><strong>Hurma:</strong> Acve (Peygamber Hurması), Sugay ve Mebrum çeşitlerini tatmadan dönmeyin.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-bold text-slate-900 mb-4">🏥 Sağlık ve Güvenlik</h3>
            <p>Sıcaklık ve yoğun kalabalık sağlık riskleri oluşturabilir.</p>
            <ul class="space-y-3 mt-4">
              <li class="flex gap-3">✅ <p><strong>Ayak Bakımı:</strong> Tavaf sırasında oluşan pişik ve yaralar için bolca vazelin kullanın.</p></li>
              <li class="flex gap-3">✅ <p><strong>Maske Kullanımı:</strong> Toz ve kalabalık nedeniyle solunum yolu enfeksiyonlarına karşı maske takın.</p></li>
              <li class="flex gap-3">✅ <p><strong>Sıvı Tüketimi:</strong> Güneş çarpmasına karşı günlük en az 3-4 litre su/zemzem tüketin.</p></li>
            </ul>
          </section>
        </div>
      `,
    },
    {
      slug: 'mekke-gezi-rehberi',
      title: 'Mekke-i Mükerreme Ziyaret Yerleri & Sanal Tur',
      excerpt: 'Kabe-i Muazzama\'dan Nur Dağı\'na, Mekke\'nin manevi duraklarını keşfedin.',
      category: 'GEZI',
      coverImage: '/images/tour/mekke/mescid-i-haram.jpg',
      content: `
        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-slate-900 mb-4">🕋 Mescid-i Haram ve Çevresi</h2>
            <p>Mekke, Müslümanların kıblesi olan Kabe'nin ev sahibidir. Her köşesi İslam tarihinin izlerini taşır.</p>
          </section>

          <section class="grid grid-cols-1 gap-6">
            <div class="bg-slate-50 p-6 rounded-2xl">
              <h3 class="font-bold text-lg mb-2">1. Kabe-i Muazzama</h3>
              <p>Yeryüzündeki ilk mabet. Hacerü'l Esved, Makam-ı İbrahim ve Hicr-i İsmail burada bulunur.</p>
            </div>
            <div class="bg-slate-50 p-6 rounded-2xl">
              <h3 class="font-bold text-lg mb-2">2. Safa ve Merve Tepeleri</h3>
              <p>Hz. Hacer'in hatırasını yaşatan Sa'y ibadetinin yapıldığı tepeler.</p>
            </div>
            <div class="bg-slate-50 p-6 rounded-2xl">
              <h3 class="font-bold text-lg mb-2">3. Nur Dağı ve Hira Mağarası</h3>
              <p>İlk vahyin indiği, peygamberliğin başladığı kutsal mekan. Tırmanış yaklaşık 1 saat sürer.</p>
            </div>
            <div class="bg-slate-50 p-6 rounded-2xl">
              <h3 class="font-bold text-lg mb-2">4. Sevr Mağarası</h3>
              <p>Hicret sırasında Peygamber Efendimiz ve Hz. Ebubekir'in sığındığı mağara.</p>
            </div>
          </section>

          <section class="bg-amber-50 p-6 rounded-2xl border border-amber-200">
            <h3 class="text-xl font-bold text-amber-900 mb-4">🌟 Hac Mekanları</h3>
            <p>Arafat (Cebelü'r Rahme), Müzdelife ve Mina (Şeytan Taşlama mevkileri) mutlaka görülmesi gereken alanlardır.</p>
          </section>
          
          <section>
            <h3 class="text-xl font-bold text-slate-900 mb-4">📜 Diğer Önemli Noktalar</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Cin Mescidi:</strong> Cinlerin Efendimiz'den Kur'an dinlediği yer.</li>
              <li><strong>Cennetü'l Mualla:</strong> Mekke'nin en eski mezarlığı, Hz. Hatice'nin kabri buradadır.</li>
              <li><strong>Peygamberimizin Doğduğu Ev:</strong> Mescid-i Haram'ın hemen dışındaki kütüphane binası.</li>
            </ul>
          </section>
        </div>
      `,
    },
    {
      slug: 'medine-gezi-rehberi',
      title: 'Medine-i Münevvere Ziyaret Rehberi',
      excerpt: 'Peygamber Şehri Medine\'deki huzur durakları ve Mescid-i Nebevi rehberi.',
      category: 'GEZI',
      coverImage: '/images/tour/medine/mescid-i-nebevi.jpg',
      content: `
        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-slate-900 mb-4">🕌 Mescid-i Nebevi: Huzurun Kalbi</h2>
            <p>Medine, Peygamber Efendimiz'in hicret yurdu ve ebedi istirahatgahıdır.</p>
          </section>

          <section class="p-6 bg-rose-50 rounded-2xl">
            <h3 class="text-xl font-bold text-rose-900 mb-4">🌿 Ravza-i Mutahhara</h3>
            <p>"Evim ile minberim arası cennet bahçelerinden bir bahçedir" buyurulan kutsal alan. Ziyaret için Nusuk uygulaması üzerinden randevu alınması şarttır.</p>
          </section>

          <section>
            <h3 class="text-xl font-bold text-slate-900 mb-4">📍 Medine'deki Önemli Mescitler</h3>
            <div class="flex flex-col gap-4">
              <div class="p-4 border-l-4 border-emerald-500 bg-emerald-50">
                <h4 class="font-bold">Kuba Mescidi</h4>
                <p>İslam tarihinde inşa edilen ilk mescit. Burada kılınan iki rekat namazın umre sevabı olduğu müjdelenmiştir.</p>
              </div>
              <div class="p-4 border-l-4 border-emerald-500 bg-emerald-50">
                <h4 class="font-bold">Kıbleteyn Mescidi</h4>
                <p>Kıblenin Kudüs'ten Kabe'ye çevrildiği, iki kıbleli mescit.</p>
              </div>
              <div class="p-4 border-l-4 border-emerald-500 bg-emerald-50">
                <h4 class="font-bold">Yedi Mescitler</h4>
                <p>Hendek Savaşı'nın yapıldığı bölgede bulunan sembolik mescitler.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-xl font-bold text-slate-900 mb-4">⛰️ Uhud Dağı ve Şehitliği</h3>
            <p>Okçular Tepesi ve Hz. Hamza (r.a.) başta olmak üzere 70 Uhud şehidinin kabirlerinin bulunduğu manevi mekan.</p>
          </section>

          <section class="bg-indigo-50 p-6 rounded-2xl">
            <h3 class="text-xl font-bold text-indigo-900 mb-4">🪦 Cennetü'l-Baki</h3>
            <p>Peygamber Efendimiz'in yakınları ve binlerce sahabi efendimizin medfun bulunduğu Medine kabristanı.</p>
          </section>
        </div>
      `,
    },
    {
      slug: 'temel-umre-dualari',
      title: 'Umre Yolculuğunda Okunacak Temel Dualar',
      excerpt: 'İhrama girerken, tavaf yaparken ve kutsal mekanlarda okunacak en önemli dualar.',
      category: 'DUA',
      coverImage: '/images/rehber/dualari.jpg',
      content: `
        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-slate-900 mb-4">📿 İbadetin Özü: Dua</h2>
            <p>Umre bir dua ve yakarış yolculuğudur. İşte her umrecinin bilmesi gereken temel zikirler.</p>
          </section>

          <section class="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-200 text-center">
            <h3 class="text-xl font-bold text-amber-900 mb-4 underline decoration-amber-500 underline-offset-8">Telbiye Duası</h3>
            <p class="text-2xl italic font-serif text-slate-800 mb-4">"Lebbeyk Allahümme lebbeyk, lebbeyke lâ şerîke leke lebbeyk..."</p>
            <p class="text-sm text-slate-600 font-medium">Anlamı: "Buyur Allah'ım buyur! Emrine amadeyim Allah'ım buyur! Senin hiçbir ortağın yoktur..."</p>
          </section>

          <section>
            <h3 class="text-xl font-bold text-slate-900 mb-4">🕋 Tavaf ve Sa'y Duaları</h3>
            <p>Her şavtta farklı dualar okunabileceği gibi, Bildiğiniz tüm duaları veya Kur'an-ı Kerim'den ayetleri okuyabilirsiniz.</p>
            <div class="mt-4 p-6 bg-slate-50 rounded-2xl">
              <p class="font-bold underline mb-2">En Kapsamlı Dua:</p>
              <p class="italic text-lg">"Rabbenâ âtinâ fi'd-dünyâ haseneten ve fi'l-âhireti haseneten ve kınâ azâbe'n-nâr."</p>
            </div>
          </section>
        </div>
      `,
    }
  ];

  for (const article of articles) {
    await prisma.guideArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
