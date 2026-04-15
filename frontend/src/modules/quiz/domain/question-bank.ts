
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
}

export const GUIDE_QUALIFICATION_QUESTIONS: QuizQuestion[] = [
    {
        id: "q1",
        question: "Umre ibadetinin rükünleri nelerdir?",
        options: [
            "İhram, Tavaf, Sa'y",
            "İhram, Tavaf, Vakfe",
            "Arafat, Müzdelife, Mina",
            "Tavaf, Sa'y, Tıraş"
        ],
        correctAnswer: 0
    },
    {
        id: "q2",
        question: "Safâ ile Merve tepeleri arasında gidip gelmeye ne ad verilir?",
        options: [
            "Tavaf",
            "Vakfe",
            "Sa'y",
            "Remel"
        ],
        correctAnswer: 2
    },
    {
        id: "q3",
        question: "Umrede ihramlı bir rehberin misafirlerine karşı sergilemesi gereken en temel etik davranış hangisidir?",
        options: [
            "Sadece en pahalı otelleri önermek",
            "Sabır, nezaket ve doğru bilgilendirme ile refakat etmek",
            "Misafirleri ibadetleri sırasında yalnız bırakmak",
            "Sadece grup içindeki zengin üyelerle ilgilenmek"
        ],
        correctAnswer: 1
    },
    {
        id: "q4",
        question: "Mescid-i Nebevi'de bulunan ve Peygamberimiz (s.a.v) tarafından 'Cennet Bahçesi' olarak nitelendirilen bölge neresidir?",
        options: [
            "Kuba Mescidi",
            "Baki Mezarlığı",
            "Ravza-i Mutahhara",
            "Uhud Tepesi"
        ],
        correctAnswer: 2
    },
    {
        id: "q5",
        question: "İhrama girilen sınır noktalarına ne ad verilir?",
        options: [
            "Harem",
            "Mikat",
            "Beytullah",
            "Makam-ı İbrahim"
        ],
        correctAnswer: 1
    },
    {
        id: "q6",
        question: "Umrede tavafın başlangıç noktası hangi nişan ile belirlenmiştir?",
        options: [
            "Altın Oluk",
            "Hacerü'l-Esved",
            "Rükn-i Yemâni",
            "Mültezem"
        ],
        correctAnswer: 1
    },
    {
        id: "q7",
        question: "Mekke'de bulunan ve İslam tarihindeki ilk vahiyin geldiği mağara hangisidir?",
        options: [
            "Sevr Mağarası",
            "Hira Mağarası",
            "Kehf Mağarası",
            "Uhud Mağarası"
        ],
        correctAnswer: 1
    },
    {
        id: "q8",
        question: "Bir rehber, misafirlerinden birinin tavaf sırasında rahatsızlandığını fark ederse ne yapmalıdır?",
        options: [
            "Tavafa devam etmesini emretmelidir",
            "Tavafı yarıda bırakıp grubu kendi haline bırakmalıdır",
            "Tavafı durdurmalı, misafirin güvenli bir alana alınmasını sağlamalı ve gerekirse tekerlekli sandalye ile devamı koordine etmelidir",
            "Misafiri kalabalığın içinde bırakıp bitiş noktasında beklemesini söylemelidir"
        ],
        correctAnswer: 2
    },
    {
        id: "q9",
        question: "Peygamberimiz (s.a.v) ve Hz. Ebubekir'in hicret sırasında gizlendikleri dağ hangisidir?",
        options: [
            "Nur Dağı",
            "Uhud Dağı",
            "Sevr Dağı",
            "Arafat Dağı"
        ],
        correctAnswer: 2
    },
    {
        id: "q10",
        question: "Rehberlik meslek etiği açısından 'emanet' bilinci neyi ifade eder?",
        options: [
            "Sadece misafirlerin paralarını korumayı",
            "Misafirlerin can, mal ve manevi yolculuklarının sorumluluğunu üstlenmeyi",
            "Misafirlerden gelen hediyeleri kabul etmeyi",
            "Tur sonundaki bahşişleri garanti altına almayı"
        ],
        correctAnswer: 1
    }
];
