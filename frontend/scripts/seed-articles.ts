import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Guide Articles...');

  const articles = [
    {
      slug: 'umre-yolculuguna-hazirlik',
      title: 'Umre Yolculuğuna Hazırlık: Adım Adım Rehber',
      excerpt: 'Kutsal topraklara yapacağınız bu manevi yolculuk öncesinde bilmeniz gereken pratik hazırlıklar.',
      category: 'YASAM',
      coverImage: '/images/rehber/hazirlik.jpg',
      content: `
        <h2>Umre Öncesi Maddi ve Manevi Hazırlık</h2>
        <p>Umre yolculuğu sadece fiziksel bir seyahat değil, aynı zamanda derin bir ruhani arınma sürecidir. Bu rehberde, hazırlık aşamasında dikkat etmeniz gerekenleri bulabilirsiniz.</p>
        
        <h3>Maddi Hazırlıklar</h3>
        <ul>
          <li><strong>Pasaport ve Vize:</strong> Geçerlilik süresi en az 6 ay olan bir pasaportunuzun olduğundan emin olun.</li>
          <li><strong>Valiz Hazırlığı:</strong> Mevsime uygun pamuklu kıyafetler, rahat ortopedik terlikler ve kişisel bakım ürünleri.</li>
          <li><strong>İlaçlar:</strong> Düzenli kullandığınız ilaçlar ve temel ağrı kesiciler/vitaminler.</li>
        </ul>

        <h3>Manevi Hazırlıklar</h3>
        <p>Yola çıkmadan önce niyetinizi tazeleyin, kul haklarını helalleşin ve temel ibadet bilgilerini (İhram, Tavaf, Sa'y) tekrar gözden geçirin.</p>
      `,
    },
    {
      slug: 'mekke-ziyaret-yerleri',
      title: 'Mekke-i Mükerreme Ziyaret Yerleri',
      excerpt: 'Mekke\'de Kabe dışında ziyaret edilmesi gereken tarihi ve manevi mekanlar.',
      category: 'GEZI',
      coverImage: '/images/tour/mekke/mescid-i-haram.jpg',
      content: `
        <h2>Kutsal Şehir Mekke'yi Keşfedin</h2>
        <p>Mekke, İslam tarihinin başladığı ve en kutsal mekanımız olan Kabe'nin bulunduğu şehirdir.</p>
        
        <h3>Önemli Ziyaret Noktaları</h3>
        <ul>
          <li><strong>Nur Dağı (Hira Mağarası):</strong> İlk vahyin geldiği yer.</li>
          <li><strong>Sevr Mağarası:</strong> Hicret sırasında Peygamberimizin ve Hz. Ebubekir'in sığındığı mağara.</li>
          <li><strong>Cennetü'l-Mualla:</strong> Hz. Hatice Validemizin de bulunduğu tarihi mezarlık.</li>
          <li><strong>Arafat ve Cebel-i Rahme:</strong> Veda Hutbesi'nin okunduğu, Hz. Adem ile Hz. Havva'nın buluştuğu yer.</li>
        </ul>
      `,
    },
    {
      slug: 'medine-ziyaret-yerleri',
      title: 'Medine-i Münevvere Ziyaret Yerleri',
      excerpt: 'Peygamber Efendimiz\'in şehri Medine\'deki kutsal mekanlar ve Siyer-i Nebi durağı.',
      category: 'GEZI',
      coverImage: '/images/tour/medine/mescid-i-nebevi.jpg',
      content: `
        <h2>Huzurun Şehri Medine</h2>
        <p>Medine, Müslümanlar için huzur ve sükunet demektir. Mescid-i Nebevi bu şehrin kalbidir.</p>
        
        <h3>Ziyaret Edilmesi Gereken Mescitler</h3>
        <ul>
          <li><strong>Kuba Mescidi:</strong> İslam tarihinde inşa edilen ilk mescit.</li>
          <li><strong>Kıbleteyn Mescidi:</strong> Kıblenin Kudüs'ten Kabe'ye çevrildiği yer.</li>
          <li><strong>Uhud Şehitliği:</strong> Hz. Hamza ve diğer şehitlerimizin bulunduğu alan.</li>
          <li><strong>Yedi Mescitler:</strong> Hendek Savaşı'nın yapıldığı bölge.</li>
        </ul>
      `,
    },
    {
      slug: 'umrede-alisveris-ve-ekonomi',
      title: 'Umre\'de Alışveriş ve Ekonomi İpuçları',
      excerpt: 'Kutsal topraklarda bütçenizi yönetmek ve en iyi hediyelikleri bulmak için pratik öneriler.',
      category: 'YASAM',
      coverImage: '/images/rehber/alisveris.jpg',
      content: `
        <h2>Bütçe Dostu Umre Alışverişi</h2>
        <p>Suudi Arabistan'da alışveriş yaparken dikkat etmeniz gereken bazı püf noktalar vardır.</p>
        
        <h3>Ne Almalı?</h3>
        <ul>
          <li><strong>Hurma:</strong> Medine'nin meşhur Acve hurması başta olmak üzere birçok çeşit.</li>
          <li><strong>Zemzem:</strong> Havalimanında veya belirlenen noktalarda bidonlarla temin edilebilir.</li>
          <li><strong>Züccaciye ve Tekstil:</strong> Seccadeler, tesbihler ve yerel kıyafetler.</li>
        </ul>

        <h3>Pazarlık ve Ödeme</h3>
        <p>Büyük mağazalar dışında pazarlık yapmak yaygındır. Para birimi SAR (Riyal) olup, çoğu yerde kredi kartı geçerlidir.</p>
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

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
