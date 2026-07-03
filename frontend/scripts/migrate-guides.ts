import { PrismaClient } from '../prisma/generated-client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Göç süreci başlıyor...');

  const articles = [
    {
      slug: 'mekke-gezi-rehberi',
      title: 'Mekke-i Mükerreme Gezi Rehberi',
      excerpt: 'Mescid-i Haram, Kabe, Safa-Merve ve Mekke\'deki tüm kutsal mekanlar hakkında detaylı gezi rehberi.',
      category: 'GEZI',
      coverImage: '/images/tour/mekke/mescid-i-haram.jpg',
      content: `
        <h2>Mescid-i Haram ve Kabe</h2>
        <p>Yeryüzündeki ilk mabet olan Kabe'yi içinde barındıran Mescid-i Haram, İslam dünyasının kalbidir. Tavaf burada yapılır. Hacerü'l-Esved, Mültezem ve Hicr-i İsmail gibi detaylarıyla incelenmelidir.</p>
        <ul>
          <li><strong>Hacerü'l-Esved:</strong> Cennetten geldiğine inanılan siyah taş.</li>
          <li><strong>Makam-ı İbrahim:</strong> Hz. İbrahim'in Kabe'yi inşa ederken üzerine çıktığı taş.</li>
          <li><strong>Safa ve Merve:</strong> Sa'y ibadetinin gerçekleştirildiği tepeler.</li>
        </ul>
        
        <h2>Mekke'deki Diğer Kutsal Mekanlar</h2>
        <h3>Nur Dağı ve Hira Mağarası</h3>
        <p>İlk vahyin geldiği ve Peygamberliğin müjdelendiği yerdir. Tırmanışı meşakkatli olsa da manevi değeri çok yüksektir.</p>
        
        <h3>Sevr Dağı ve Mağarası</h3>
        <p>Hicret sırasında Peygamberimiz ve Hz. Ebubekir'in gizlendiği yerdir.</p>
        
        <h3>Arafat ve Cebel-i Rahme</h3>
        <p>Haccın en önemli rüknü olan vakfenin yapıldığı yerdir. Hz. Adem ile Hz. Havva'nın buluştuğu yer olarak bilinir.</p>
      `
    },
    {
      slug: 'medine-gezi-rehberi',
      title: 'Medine-i Münevvere Gezi Rehberi',
      excerpt: 'Mescid-i Nebevi, Ravza-i Mutahhara ve Medine-i Münevvere\'deki sahabe kabirleri hakkında rehber.',
      category: 'GEZI',
      coverImage: '/images/tour/medine/mescid-i-nebevi.jpg',
      content: `
        <h2>Mescid-i Nebevi</h2>
        <p>Peygamber Efendimiz (s.a.v.)'in inşa ettiği, içinde Ravza-i Mutahhara ve Hücre-i Saadet'i barındıran huzur mekanıdır.</p>
        <ul>
          <li><strong>Ravza-i Mutahhara:</strong> "Evimle minberim arası cennet bahçelerinden bir bahçedir" hadisiyle müjdelenen alan.</li>
          <li><strong>Baki Mezarlığı (Cennetü'l-Baki):</strong> On binlerce sahabenin ve Peygamberimizin aile fertlerinin medfun olduğu mezarlık.</li>
        </ul>
        
        <h2>Medine'deki Tarihi Camiler</h2>
        <h3>Kuba Mescidi</h3>
        <p>İslam tarihinde inşa edilen ilk mescittir. Burada kılınan iki rekat namaz, bir umre sevabına denktir.</p>
        
        <h3>Kıbleteyn Mescidi</h3>
        <p>Kıblenin Kudüs'ten Kabe'ye çevrildiği, iki kıbleli mescit.</p>
        
        <h3>Uhud Şehitliği</h3>
        <p>Uhud Savaşı'nın yapıldığı ve Hz. Hamza (r.a.) başta olmak üzere 70 şehidimizin bulunduğu yerdir.</p>
      `
    },
    {
      slug: 'umre-yasam-rehberi',
      title: 'Umre Yaşam Rehberi: Pratik Bilgiler',
      excerpt: 'Kutsal topraklarda hayatınızı kolaylaştıracak alışveriş, yeme-içme, sağlık ve teknoloji tavsiyeleri.',
      category: 'YASAM',
      coverImage: '/images/rehber/alisveris.jpg',
      content: `
        <h2>Alışveriş ve Hediyelik</h2>
        <p>Hurma alışverişi için Medine'deki Merkezi Hurma Pazarı en ideal yerdir. Acve, Mebrum ve Safavi çeşitleri tercih edilmelidir. Mekke'de ise seccade ve tesbih için otel altı çarşıları uygundur.</p>
        
        <h2>Yeme-İçme Tavsiyeleri</h2>
        <p>Arap mutfağına özgü Mandi ve Kabsa denenebilir. Fast food tercih edenler için bölgenin efsanesi <strong>Al Baik</strong> mutlaka ziyaret edilmelidir. Su tüketiminde ise çeşme suyundan kaçınılmalı, zemzem suyu tercih edilmelidir.</p>
        
        <h2>Dijital Uygulamalar</h2>
        <p><strong>Nusuk:</strong> Ravza ziyareti ve umre izinleri için zorunludur. <strong>Careem/Uber:</strong> Ulaşım için en güvenli yoldur.</p>
        
        <h2>Sağlık İpuçları</h2>
        <p>Yürüyüşler nedeniyle ayak sağlığına dikkat edilmeli, pişik kremi ve nemlendirici bulundurulmalıdır. "Umre öksürüğü"ne karşı bol su içilmeli ve klimalardan kaçınılmalıdır.</p>
      `
    },
    {
      slug: 'temel-umre-dualar',
      title: 'Temel Umre Duaları',
      excerpt: 'Tavaf, Sa\'y ve kutsal mekanlarda okunması tavsiye edilen temel Arapça dualar ve Türkçe anlamları.',
      category: 'DUA',
      coverImage: '/images/tour/mekke/kaaba.jpg',
      content: `
        <h2>İhrama Girerken Okunacak Telbiye</h2>
        <p><em>"Lebbeyk Allâhümme lebbeyk, lebbeyke lâ şerîke leke lebbeyk, innel hamde ven-ni'mete leke vel-mülk, lâ şerîke lek."</em></p>
        
        <h2>Tavaf Duaları</h2>
        <p>Tavaf sırasında belirli bir dua zorunluluğu yoktur ancak "Rabbenâ âtinâ" duası en sık okunan dualardandır. Ayrıca her şavtta farklı esmalar zikredilebilir.</p>
        
        <h2>Sa'y Duaları</h2>
        <p>Safa ve Merve tepeleri arasında Hz. Hacer validemizin teslimiyetini hatırlayarak dua ve zikirle yürümek esastır.</p>
      `
    }
  ];

  for (const article of articles) {
    await prisma.guideArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
    console.log(`✅ Makale işlendi: ${article.title}`);
  }

  console.log('🎉 Göç başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
