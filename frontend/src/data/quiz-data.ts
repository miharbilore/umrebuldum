export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

export const UMRAH_QUIZ_DATA: QuizQuestion[] = [
    {
        id: 1,
        question: "Hac ve Umre için niyet edilen ve ihrama girilen sınır bölgelerine ne ad verilir?",
        options: ["Vakfe", "Mikat", "Safa", "Merve"],
        correctAnswer: 1
    },
    {
        id: 2,
        question: "Umre'nin kelime anlamı nedir?",
        options: ["Ziyaret etmek", "Dua etmek", "Yürümek", "Kurban kesmek"],
        correctAnswer: 0
    },
    {
        id: 3,
        question: "İhram yasakları ne zaman başlar?",
        options: ["Kabe'yi görünce", "Tavafa başlayınca", "Niyet edip telbiye getirince", "Mekke'ye girince"],
        correctAnswer: 2
    },
    {
        id: 4,
        question: "Kabe'nin etrafında yedi defa dönmeye ne denir?",
        options: ["Sa'y", "Vakfe", "Sema", "Tavaf"],
        correctAnswer: 3
    },
    {
        id: 5,
        question: "Tavafın her bir dönüşüne ne ad verilir?",
        options: ["Şavt", "Rükün", "Hacer", "Makam"],
        correctAnswer: 0
    },
    {
        id: 6,
        question: "Safa ile Merve tepeleri arasında gidip gelmeye ne denir?",
        options: ["Tavaf", "Vakfe", "Sa'y", "Remiy"],
        correctAnswer: 2
    },
    {
        id: 7,
        question: "Sa'y ibadeti sırasında Safa'dan Merve'ye gidiş ve Merve'den Safa'ya dönüş toplam kaç şavttır?",
        options: ["3", "5", "7", "9"],
        correctAnswer: 2
    },
    {
        id: 8,
        question: "Umrede ihramdan çıkmak için erkeklerin saçlarını tamamen kazıtmasına veya kısaltmasına ne denir?",
        options: ["Halk ve Taksir", "Vakfe", "İstila", "Remal"],
        correctAnswer: 0
    },
    {
        id: 9,
        question: "Aşağıdakilerden hangisi Umre'nin rükünlerindendir?",
        options: ["Arafat'ta vakfe", "Müzdelife'de gecelemek", "Tavaf", "Şeytan taşlamak"],
        correctAnswer: 2
    },
    {
        id: 10,
        question: "Tavaf nereden başlar?",
        options: ["Makam-ı İbrahim", "Hacerü'l-Esved hizasından", "Safa tepesinden", "Altınoluk altından"],
        correctAnswer: 1
    },
    {
        id: 11,
        question: "Kabe'nin güneydoğu köşesinde bulunan siyah taşa ne ad verilir?",
        options: ["Makam-ı İbrahim", "Hacerü'l-Esved", "Hatim", "Mültezem"],
        correctAnswer: 1
    },
    {
        id: 12,
        question: "Umre ziyaretinde Peygamber Efendimiz'in kabrinin bulunduğu şehir hangisidir?",
        options: ["Mekke", "Cidde", "Medine", "Taif"],
        correctAnswer: 2
    },
    {
        id: 13,
        question: "Erkeklerin ihramda giydikleri iki parçalı dikişsiz örtüye ne denir?",
        options: ["Cübbe", "İzar ve Rida", "Kaftan", "Ferace"],
        correctAnswer: 1
    },
    {
        id: 14,
        question: "Aşağıdakilerden hangisi ihram yasaklarından biridir?",
        options: ["Su içmek", "Yemek yemek", "Koku sürünmek", "Uyumak"],
        correctAnswer: 2
    },
    {
        id: 15,
        question: "İhrama girerken söylenen 'Lebbeyk ALLAHümme Lebbeyk...' cümlesine ne ad verilir?",
        options: ["Tekbir", "Tehlil", "Telbiye", "Salavat"],
        correctAnswer: 2
    },
    {
        id: 16,
        question: "Kabe'nin çevresinde tavaf yapılan alana ne ad verilir?",
        options: ["Mataf", "Mes'a", "Mina", "Arafat"],
        correctAnswer: 0
    },
    {
        id: 17,
        question: "Sa'y ibadeti hangi iki tepe arasında yapılır?",
        options: ["Nur ve Sevr", "Arafat ve Müzdelife", "Safa ve Merve", "Uhud ve Hendek"],
        correctAnswer: 2
    },
    {
        id: 18,
        question: "Zemzem suyu nerede çıkar?",
        options: ["Medine'de", "Kudüs'te", "Mekke'de, Kabe yakınında", "Bağdat'ta"],
        correctAnswer: 2
    },
    {
        id: 19,
        question: "Sevr Mağarası hangi şehirde bulunmaktadır?",
        options: ["Mekke", "Medine", "Kudüs", "Şam"],
        correctAnswer: 0
    },
    {
        id: 20,
        question: "Umre'de Peygamber Efendimiz'in (s.a.v) doğduğu evi ziyaret etmek sünnet midir?",
        options: ["Farzdır", "Sünnettir ve sevaptır", "Vaciptir", "Haramdır"],
        correctAnswer: 1
    },
    {
        id: 21,
        question: "Aşağıdakilerden hangisi mikat sınırlarından biridir?",
        options: ["Zülhuleyfe", "Hira", "Uhud", "Kuba"],
        correctAnswer: 0
    },
    {
        id: 22,
        question: "Mekke'ye hangi amaçla gelinirse gelinsin, Mikat sınırında ihrama girmek gerekir mi?",
        options: ["Evet, gerekir", "Hayır, gerekmez", "Sadece Hac için gerekir", "Sadece kurban için gerekir"],
        correctAnswer: 0
    },
    {
        id: 23,
        question: "Kadınlar ihramda nasıl giyinirler?",
        options: ["Dikişsiz beyaz örtü", "Normal tesettür kıyafeti", "Özel bir üniforma", "Siyah pelerin"],
        correctAnswer: 1
    },
    {
        id: 24,
        question: "Tavaf sırasında Hacerü'l-Esved'i selamlamaya ne denir?",
        options: ["İstila", "İstimlam", "İstişare", "İstikamet"],
        correctAnswer: 1
    },
    {
        id: 25,
        question: "Kabe'nin içinde bulunduğu büyük camiye ne ad verilir?",
        options: ["Mescid-i Aksa", "Mescid-i Nebevi", "Mescid-i Haram", "Mescid-i Kuba"],
        correctAnswer: 2
    },
    {
        id: 26,
        question: "Hac ile Umre arasındaki temel fark nedir?",
        options: ["Umre'de tavaf yoktur", "Hac belirli günlerde yapılır, Umre her zaman", "Hac'da niyet gerekmez", "Umre'de sa'y yoktur"],
        correctAnswer: 1
    },
    {
        id: 27,
        question: "Peygamber Efendimiz'in (s.a.v) mescidinin içinde bulunan ve 'Cennet Bahçelerinden bir bahçe' olarak adlandırılan yer neresidir?",
        options: ["Kuba Mescidi", "Ravza-i Mutahhara", "Mescid-i Kıbleteyn", "Baki Mezarlığı"],
        correctAnswer: 1
    },
    {
        id: 28,
        question: "İhramda iken tırnak kesmek veya saç koparmak neyi gerektirir?",
        options: ["Namaza engeldir", "Ceza (kurban veya sadaka) gerektirir", "Hiçbir şey gerektirmez", "Abdesti bozar"],
        correctAnswer: 1
    },
    {
        id: 29,
        question: "Mekke'de bulunan 'Nur Dağı'nın önemi nedir?",
        options: ["İlk vahyin indiği Hira Mağarası oradadır", "Hz. İbrahim kurban kesmiştir", "Şeytan taşlama yeridir", "Müzdelife vakfesidir"],
        correctAnswer: 0
    },
    {
        id: 30,
        question: "Kabe'nin çevresini yedi kez dönmekle ne tamamlanmış olur?",
        options: ["Bir şavt", "Bir Umre", "Bir tavaf", "Bir vakfe"],
        correctAnswer: 2
    }
];
