"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  Grid3X3, 
  Info, 
  MapPin, 
  Clock, 
  Lightbulb,
  Home,
  Compass,
  BookOpen,
  Star,
  Mountain,
  Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mekke Mekanlari
const mekkePlaces = [
  {
    id: "mescid-i-haram",
    title: "Mescid-i Haram ve Kabe",
    subtitle: "Yeryuzundeki Ilk Mabet",
    image: "https://images.unsplash.com/photo-1591414442261-2490dfbf8d2a?q=80&w=800",
    description: "Suphesiz listenin en basinda yer alir. Yeryuzundeki ilk mabet olan Kabe'yi icinde barindirir. Tavaf burada yapilir. Mescid-i Haram, sadece tavaf alani degil, ayni zamanda Osmanli revaklari, Hacerul-Esved, Multezem ve Hicr-i Ismail gibi detaylariyla incelenmelidir.",
    highlights: [
      "Kabe - Yeryuzundeki ilk mabet, tum Muslumanlarin kiblesi",
      "Hacerul-Esved - Cennetten geldigi inanilan siyah tas",
      "Multezem - Kabe kapisi ile Hacerul-Esved arasi, dualarin kabul oldugu yer",
      "Hicr-i Ismail - Kabe'nin orijinal planina dahil yarim ay seklindeki alan",
      "Osmanli Revaklari - Tarihi mimari eserler"
    ],
    tips: [
      "Tavaf namazini Makam-i Ibrahim'in arkasinda kilin",
      "Kalabalik saatlerden kacinmak icin gece veya sabah erken saatleri tercih edin",
      "Zemzem suyunu icmeyi unutmayin",
      "Tavafa Hacerul-Esved hizasindan baslayin"
    ],
    duration: "2-4 saat",
    category: "Farz Ibadet Yeri"
  },
  {
    id: "hacerul-esved",
    title: "Hacerul-Esved",
    subtitle: "Cennet Tasi",
    image: "https://images.unsplash.com/photo-1565552643534-114eeffb1a20?q=80&w=800",
    description: "Hz. Ibrahim'in Kabe'yi insa ederken yerlestirdigi, cennetten geldigi rivayet edilen siyah tastir. Tavafa bu tasin hizasindan baslanir. Peygamberimiz bu tasi opmustur, ancak kalabalikta uzaktan selamlama (istilam) da caizdir.",
    highlights: [
      "Tavafin baslangic noktasi",
      "Cennet taslarindan biri olduguna inanilir",
      "Gumus cerceve icinde muhafaza edilir",
      "Peygamberimizin sunnetine uygun ziyaret"
    ],
    tips: [
      "Kalabalikta zorlamayin, uzaktan el kaldirarak selamlayin",
      "Gece saatlerinde yaklasim daha kolay olabilir",
      "Izdiham aninda sabir ve sukut muhafaza edin"
    ],
    duration: "15-30 dakika",
    category: "Kutsal Mekan"
  },
  {
    id: "makam-ibrahim",
    title: "Makam-i Ibrahim",
    subtitle: "Hz. Ibrahim'in Ayak Izi",
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=800",
    description: "Hz. Ibrahim'in Kabe'yi insa ederken uzerine ciktigi ve ayak izinin bulunduguna inanilan tastir. Altin ve kristal muhafaza icinde saklanir. Tavaf namazi genellikle bu makamin arkasinda kilinir.",
    highlights: [
      "Hz. Ibrahim'in ayak izleri gorunur",
      "Tavaf namazinin kilindigi yer",
      "Altin-kristal muhafaza icinde",
      "Kabe'nin hemen yakininda konumlu"
    ],
    tips: [
      "Tavaf bitiminde burada 2 rekat namaz kilin",
      "Cok kalabalik olursa biraz geride de kilinabilir",
      "Dualarinizi samimiyetle yapin"
    ],
    duration: "15-20 dakika",
    category: "Ibadet Yeri"
  },
  {
    id: "safa-merve",
    title: "Safa ve Merve Tepeleri",
    subtitle: "Sa'y Ibadeti",
    image: "https://images.unsplash.com/photo-1568864757362-eeb66952d7e0?q=80&w=800",
    description: "Mescid-i Haram'in hemen bitisigindedir. Hz. Hacer'in su arayisini temsil eden 'Sa'y' ibadeti bu iki tepe arasinda gerceklestirilir. Gunumuzde kapali ve klimali bir koridor halindedir. Yesil isikli bolumde erkeklerin 'hervele' (hizli adimlarla yurume) yapmasi sunnettir.",
    highlights: [
      "Hz. Hacer'in su arayisi hatirlenir",
      "Sa'y ibadeti burada yapilir",
      "7 kez gidis-gelis (toplam 3.15 km)",
      "Klimali modern koridor",
      "Yesil isikli hervele bolumu"
    ],
    tips: [
      "Safa'dan baslayin, Merve'de bitirin",
      "Yesil isiklar arasinda erkekler hizli yurusun",
      "Dua ederek yurumeye devam edin",
      "Tekerlekli sandalye hizmeti mevcut"
    ],
    duration: "45-60 dakika",
    category: "Farz Ibadet"
  },
  {
    id: "zemzem",
    title: "Zemzem Kuyusu",
    subtitle: "Kutsal Su Kaynagi",
    image: "https://images.unsplash.com/photo-1591414442261-2490dfbf8d2a?q=80&w=800",
    description: "Kabe'nin yakininda bulunan ve Hz. Ismail'e Allah tarafindan ihsan edilen kutsal su kaynagadir. 4000 yildir kesintisiz akan bu su, sifa ve bereket kaynagi olarak kabul edilir. Gunumuzde modern sebiller araciligiyla dagilir.",
    highlights: [
      "Hz. Ismail icin mucizevi olarak fiskirdi",
      "4000 yildir kesintisiz akiyor",
      "Sifa ozellikleri olduguna inanilir",
      "Modern sogutma sistemleriyle sunuluyor",
      "Kabe'nin 20 metre dogusunda"
    ],
    tips: [
      "Kibleye donerek icin",
      "Ayakta, uc nefeste icmek sunnettir",
      "Sifa niyetiyle icmeniz mumkun",
      "Yaninda gotureceginiz icin bidonlar mevcut"
    ],
    duration: "10-15 dakika",
    category: "Kutsal Mekan"
  },
  {
    id: "hira-magarasi",
    title: "Nur Dagi ve Hira Magarasi",
    subtitle: "Ilk Vahyin Geldigi Yer",
    image: "https://images.unsplash.com/photo-1565552643534-114eeffb1a20?q=80&w=800",
    description: "Hz. Muhammed'e (s.a.v.) ilk vahyin geldigi ve peygamberligin mujdelendigi magaranin bulundugu dagdir. Tirmanisi biraz mesakkatli olsa da manevi degeri cok yuksektir. Peygamberimiz burada tefekkur eder, ibadet ederdi.",
    highlights: [
      "Ilk vahiy (Ikra) burada indi",
      "Peygamberimizin tefekkur yeri",
      "Yaklasik 634 metre yukseklikte",
      "Mekke'nin panoramik manzarasi",
      "Cebrail (a.s.) ilk kez burada gorundu"
    ],
    tips: [
      "Sabah namazindan once serinlikte cikin",
      "Rahat ayakkabi giyin",
      "Su ve atistirmalik alin",
      "Fiziksel durum gerektir, dikkatli olun",
      "1-2 saat tirmanis suresi"
    ],
    duration: "2-3 saat (tirmanis dahil)",
    category: "Tarihi Mekan"
  },
  {
    id: "sevr-magarasi",
    title: "Sevr Dagi ve Magarasi",
    subtitle: "Hicret'in Saklanma Noktasi",
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=800",
    description: "Peygamberimizin Hz. Ebubekir ile birlikte Hicret sirasinda gizlendigi ve orumcek agi/guvercin yuvasi mucizelerinin yasandigi yerdir. Hicretin en kritik saklanma noktasidir. Uc gun burada kaldilar.",
    highlights: [
      "Hz. Peygamber ve Hz. Ebubekir'in siginagi",
      "Orumcek agi mucizesi",
      "Guvercin yuvasi mucizesi",
      "Uc gun saklanma yeri",
      "Hicretin donum noktasi"
    ],
    tips: [
      "Hira'dan daha zor bir tirmanis",
      "Rehber esliginde cikin",
      "Sicak saatlerden kacinin",
      "En az 3-4 saat ayirin"
    ],
    duration: "3-4 saat (tirmanis dahil)",
    category: "Tarihi Mekan"
  },
  {
    id: "darul-erkam",
    title: "Darul Erkam",
    subtitle: "Islam'in Ilk Okulu",
    image: "https://images.unsplash.com/photo-1568864757362-eeb66952d7e0?q=80&w=800",
    description: "Islam'in ilk yillarinda Muslumanlarin gizlice toplandigi, egitim aldigi ve Hz. Omer'in Musluman oldugu evdir. Gunumuzde Safa tepesi civarinda Mescid-i Haram sinirlari icindedir.",
    highlights: [
      "Islam'in ilk egitim merkezi",
      "Hz. Omer burada Musluman oldu",
      "Gizli davet donemi toplanti yeri",
      "Safa tepesi yakininda",
      "Mescid-i Haram sinirlari icinde"
    ],
    tips: [
      "Safa tepesini ziyaret ederken ugrayabilirsiniz",
      "Tarihi onemi hakkinda bilgi edinin",
      "Rehber esliginde daha anlamli"
    ],
    duration: "15-20 dakika",
    category: "Tarihi Mekan"
  },
  {
    id: "arafat",
    title: "Arafat ve Cebel-i Rahme",
    subtitle: "Haccin En Onemli Ruknu",
    image: "https://images.unsplash.com/photo-1591414442261-2490dfbf8d2a?q=80&w=800",
    description: "Haccin en onemli ruknu olan vakfenin yapildigi yerdir. Cebel-i Rahme (Rahmet Dagi), Hz. Adem ile Hz. Havva'nin dunyada bulustugu yer olarak bilinir. Veda Hutbesi burada okunmustur.",
    highlights: [
      "Haccin en buyuk ruknu - Arafat Vakfesi",
      "Hz. Adem ve Hz. Havva'nin bulusma yeri",
      "Veda Hutbesi burada okundu",
      "Rahmet Dagi ve beyaz sutun",
      "Zilhicce 9'unda milyonlar toplanir"
    ],
    tips: [
      "Umre'de ziyaret edilebilir ancak zorunlu degil",
      "Zilhicce 9'unda vakfe yapilir (Hac icin)",
      "Dua ve istigfar ile mesgul olun",
      "Semsiye ve su tasiyin"
    ],
    duration: "2-3 saat (ziyaret)",
    category: "Hac Ruknu"
  },
  {
    id: "muzdelife",
    title: "Muzdelife",
    subtitle: "Geceleme ve Tas Toplama",
    image: "https://images.unsplash.com/photo-1565552643534-114eeffb1a20?q=80&w=800",
    description: "Arafat'tan sonra gecilen ve Hac'da seytan taslamak icin taslarin toplandigi, geceleme yapilan alandir. Burada geceleme yapmak vaciptir. Acik alanda ibadet ve dua ile geceler.",
    highlights: [
      "Hac gecelemesi yapilan yer",
      "Cemerat taslari burada toplanir",
      "Acik alanda ibadet",
      "Arafat'tan Mina'ya gecis noktasi",
      "Aksam ve yatsi namazlari cem edilir"
    ],
    tips: [
      "Aksam ve yatsi namazlari cem edilerek kilinir",
      "70 adet cakil tasi toplayin",
      "Geceleme icin battaniye alin",
      "Sabir ve sukur ile bekleyin"
    ],
    duration: "Gece boyunca",
    category: "Hac Ruknu"
  },
  {
    id: "mina-cemerat",
    title: "Mina ve Cemerat",
    subtitle: "Seytan Taslama",
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=800",
    description: "Hz. Ibrahim'in seytani tasladigi yerdir. Hac ibadeti sirasinda seytan taslama (Cemerat) ve kurban kesme islemleri burada yapilir. Modern cok katli Cemerat Koprusu taslamalari kolaylastirir.",
    highlights: [
      "Hz. Ibrahim'in seytani reddetmesi",
      "Uc cemre: Sugra, Vusta, Kubra",
      "Kurban kesim merkezi",
      "Modern cok katli yapi",
      "Bayram gunleri burada gecilir"
    ],
    tips: [
      "Izdihamdan kacinmak icin saat planlayin",
      "Taslari Muzdelife'den toplayin",
      "7'ser tas her cemreye",
      "Sabirli ve dikkatli olun"
    ],
    duration: "1-2 saat",
    category: "Hac Ruknu"
  },
  {
    id: "cin-mescidi",
    title: "Cin Mescidi",
    subtitle: "Cinlerin Musluman Oldugu Yer",
    image: "https://images.unsplash.com/photo-1568864757362-eeb66952d7e0?q=80&w=800",
    description: "Peygamberimizin cinlere Kur'an-i Kerim okudugu ve onlarin da Musluman oldugu rivayet edilen yere insa edilmistir. Cennetul-Mualla mezarligina yakindir.",
    highlights: [
      "Cinlerin Islam'i kabul ettigi yer",
      "Peygamberimizin Kur'an tilaveti",
      "Cennetul-Mualla yakininda",
      "Tarihi kucuk mescit"
    ],
    tips: [
      "Cennetul-Mualla ziyareti ile birlestirin",
      "Namaz kilinabilir",
      "Sakin ve huzurlu ortam"
    ],
    duration: "15-30 dakika",
    category: "Tarihi Mekan"
  },
  {
    id: "cennetul-mualla",
    title: "Cennetul-Mualla",
    subtitle: "Mekke Mezarligi",
    image: "https://images.unsplash.com/photo-1591414442261-2490dfbf8d2a?q=80&w=800",
    description: "Mekke'nin en eski ve en bilinen mezarligidir. Peygamberimizin ilk esi Hz. Hatice ve dedesi Abdulmuttalip basta olmak uzere bircok onemli sahabenin kabri buradadir.",
    highlights: [
      "Hz. Hatice validemizin kabri",
      "Abdulmuttalip'in kabri",
      "Bircok sahabenin medfun oldugu yer",
      "Mekke'nin en eski mezarligi",
      "Ebu Talib'in kabri"
    ],
    tips: [
      "Fatiha ve dua okuyun",
      "Sessiz ve hurmetli davranin",
      "Fotograf cekmek uygun degildir",
      "Sabah saatleri daha sakin"
    ],
    duration: "20-30 dakika",
    category: "Ziyaret Yeri"
  }
]

// Medine Mekanlari
const medinePlaces = [
  {
    id: "mescid-i-nebevi",
    title: "Mescid-i Nebevi",
    subtitle: "Peygamber Mescidi",
    image: "https://images.unsplash.com/photo-1591604129930-f11bf88d1d86?q=80&w=800",
    description: "Medine'nin kalbidir. Peygamberimizin insa ettigi bu mescidin icinde Hucre-i Saadet ve cennet bahcelerinden bir bahce olarak mujdelenen Ravza-i Mutahhara bulunur. Medine, Hac veya Umre rukunlerinin yapildigi yer olmamakla birlikte, Peygamberimizin kabrini barindirdigi icin bu kutsal yolculugun ayrilmaz ve en huzurlu parcasidir.",
    highlights: [
      "Peygamberimizin insa ettigi mescit",
      "Yesil Kubbe - Ikonik yapi",
      "Acilir kapanir dev semsiyeler",
      "Dunyanin en buyuk mescitlerinden",
      "1 milyon kisi kapasiteli",
      "Burada kililan namaz 1000 kat sevapli"
    ],
    tips: [
      "Kalabalik zamanlarda sabir gosterin",
      "40 vakit namaz kilmaya calisin",
      "Mescit adabina dikkat edin",
      "Peygamberimizi ziyaret ederken saygi ve sessizlik"
    ],
    duration: "Sinirsiz",
    category: "Ana Ziyaret Yeri"
  },
  {
    id: "ravza",
    title: "Ravza-i Mutahhara",
    subtitle: "Cennet Bahcesi",
    image: "https://images.unsplash.com/photo-1590846406792-0ca1f240fcb6?q=80&w=800",
    description: "'Evimle minberim arasi cennet bahcelerinden bir bahcedir' hadisiyle mujdelenen yesil halili alandir. Buraya girisler artik 'Nusuk' uygulamasi uzerinden randevu ile yapilmaktadir. Son derece ozel ve manevi bir alandir.",
    highlights: [
      "Cennet bahcelerinden bir bahce",
      "Yesil halili ozel alan",
      "Peygamberimizin minberi",
      "Yaklasik 22x15 metre genislikte",
      "Nusuk uygulamasiyla randevu sistemi"
    ],
    tips: [
      "Nusuk uygulamasindan randevu alin",
      "Randevu saatinize sadik kalin",
      "Namazinizi burada kilmaya calisin",
      "Kalabalik olacaktir, sabir gosterin"
    ],
    duration: "30-45 dakika",
    category: "En Kutsal Alan"
  },
  {
    id: "hucre-i-saadet",
    title: "Hucre-i Saadet",
    subtitle: "Peygamberimizin Kabr-i Serif'i",
    image: "https://images.unsplash.com/photo-1591604129930-f11bf88d1d86?q=80&w=800",
    description: "Peygamberimiz (s.a.v.), Hz. Ebubekir ve Hz. Omer'in kabirlerinin bulundugu altin kafesli kutsal alandir. Burada Peygamberimize selam verilir ve dua edilir. Muwajaha (Altin Kafes) onunde durup selam vermek adettendir.",
    highlights: [
      "Hz. Muhammed'in (s.a.v.) kabri",
      "Hz. Ebubekir'in kabri",
      "Hz. Omer'in kabri",
      "Altin kafes (Muwajaha) ile cevrilmis",
      "Dunyanin en kutsal kabirlerinden"
    ],
    tips: [
      "Peygamberimize selam verin",
      "Hurmet ve edep ile yaklasin",
      "Dua ve salavat getirin",
      "Kalabalikta sabirli olun",
      "Sessizligi muhafaza edin"
    ],
    duration: "15-20 dakika",
    category: "En Kutsal Alan"
  },
  {
    id: "kuba-mescidi",
    title: "Kuba Mescidi",
    subtitle: "Islam'in Ilk Mescidi",
    image: "https://images.unsplash.com/photo-1590846406792-0ca1f240fcb6?q=80&w=800",
    description: "Islam tarihinde insa edilen ilk mescittir. Peygamberimiz Hicret yolculugu sirasinda burada konaklamis ve bu mescidi insa etmistir. Burada kilnan iki rekat namaz bir umre sevabina denktir. Cumartesi gunleri ziyaret etmek sunnettir. Medine merkezden Kuba'ya uzanan 'Sunnet Yolu' yuruyus parkuru bulunmaktadir.",
    highlights: [
      "Islam'in ilk mescidi",
      "Peygamberimizin insa ettigi",
      "2 rekat namaz = 1 umre sevabi",
      "Cumartesi ziyareti sunnet",
      "Sunnet Yolu yuruyus parkuru"
    ],
    tips: [
      "Cumartesi gunu ziyaret edin",
      "2 rekat namaz kilin",
      "Sunnet Yolu'ndan yuruyerek gidin",
      "Mescit temiz ve ferah"
    ],
    duration: "30-45 dakika",
    category: "Tarihi Mescit"
  },
  {
    id: "uhud",
    title: "Uhud Dagi ve Sehitligi",
    subtitle: "Sehitler Diyari",
    image: "https://images.unsplash.com/photo-1591604129930-f11bf88d1d86?q=80&w=800",
    description: "Islam tarihinin en onemli savaslarindan biri olan Uhud Savasi'nin yapildigi yerdir. Basta Peygamberimizin amcasi Hz. Hamza olmak uzere 70 Uhud sehidinin kabri burada ziyaret edilir. Peygamberimiz 'Uhud bizi sever, biz de Uhud'u severiz' buyurmustur.",
    highlights: [
      "Hz. Hamza'nin kabri",
      "70 Uhud sehidinin mezarligi",
      "Uhud Savasi alani",
      "Okculer Tepesi",
      "Peygamberimizin sevdigi dag"
    ],
    tips: [
      "Fatiha ve dua okuyun",
      "Hz. Hamza'nin kabrini ziyaret edin",
      "Tarihi olaylari hatirlayin",
      "Rehber esliginde daha faydali"
    ],
    duration: "1-2 saat",
    category: "Tarihi Mekan"
  },
  {
    id: "cennetul-baki",
    title: "Cennetul-Baki",
    subtitle: "Medine Mezarligi",
    image: "https://images.unsplash.com/photo-1590846406792-0ca1f240fcb6?q=80&w=800",
    description: "Mescid-i Nebevi'nin hemen yanindaki Medine'nin ana mezarligidir. Peygamberimizin kizlari, esleri, torunu Hz. Hasan, Hz. Osman ve on binlerce sahabenin kabri buradadir.",
    highlights: [
      "Hz. Osman'in kabri",
      "Hz. Hasan'in kabri",
      "Peygamberimizin kizlari ve esleri",
      "On binlerce sahabe",
      "Mescid-i Nebevi'nin hemen yaninda"
    ],
    tips: [
      "Sabah namazindan sonra ziyaret edin",
      "Fatiha ve dua okuyun",
      "Sessiz ve hurmetli olun",
      "Erkekler icin acik"
    ],
    duration: "30-45 dakika",
    category: "Ziyaret Yeri"
  },
  {
    id: "kibleteyn",
    title: "Kibleteyn Mescidi",
    subtitle: "Iki Kibleli Mescit",
    image: "https://images.unsplash.com/photo-1591604129930-f11bf88d1d86?q=80&w=800",
    description: "Namaz kilinirken kiblenin Mescid-i Aksa'dan Kabe'ye cevrildigi mescittir. Bu tarihi an bu mescitte yasanmis ve iki mihrap ile sembolize edilmistir. Kible degisikligi ayeti burada nazil oldu.",
    highlights: [
      "Kible degisikliginin yasandigi yer",
      "Iki mihrapli mescit",
      "Tarihi onem",
      "Beyaz modern mimari"
    ],
    tips: [
      "2 rekat namaz kilin",
      "Tarihi onemini ogrenin",
      "Rehber aciklamasi faydali"
    ],
    duration: "20-30 dakika",
    category: "Tarihi Mescit"
  },
  {
    id: "yedi-mescit",
    title: "Yedi Mescitler",
    subtitle: "Hendek Savasi Alani",
    image: "https://images.unsplash.com/photo-1590846406792-0ca1f240fcb6?q=80&w=800",
    description: "Hendek Savasi'nin yapildigi alanda bulunan, sahabe komutanlarinin cadirlarinin kuruldugu yerlere sonradan insa edilen kucuk mescitler toplulugudur. Selman-i Farisi'nin hendek kazma fikrini verdigi yer.",
    highlights: [
      "Hendek Savasi alani",
      "Sahabe cadirlarinin yerleri",
      "Feth Mescidi (en onemli)",
      "Selman-i Farisi'nin fikri",
      "Sel' Dagi eteklerinde"
    ],
    tips: [
      "Tarihi bilgiyle ziyaret edin",
      "Her mescitte namaz kilabilirsiniz",
      "Hendek savasi hikayesini bilin"
    ],
    duration: "30-45 dakika",
    category: "Tarihi Mekan"
  },
  {
    id: "cuma-mescidi",
    title: "Cuma Mescidi",
    subtitle: "Ilk Cuma Namazi",
    image: "https://images.unsplash.com/photo-1591604129930-f11bf88d1d86?q=80&w=800",
    description: "Peygamberimizin Kuba'dan Medine merkeze gecerken ilk Cuma namazini kildirdigi yerdir. Islam tarihinde ilk Cuma namazi burada kilindi. Ilk Cuma hutbesi de burada okundu.",
    highlights: [
      "Islam'in ilk Cuma namazi",
      "Peygamberimizin ilk hutbesi",
      "Tarihi kucuk mescit",
      "Hicret guzergahinda"
    ],
    tips: [
      "Cuma gunu ziyaret edin",
      "Tarihi onemi ogrenin",
      "Namaz kilin"
    ],
    duration: "15-20 dakika",
    category: "Tarihi Mescit"
  },
  {
    id: "gamame-mescidi",
    title: "Gamame (Bulut) Mescidi",
    subtitle: "Bayram Namazi Yeri",
    image: "https://images.unsplash.com/photo-1590846406792-0ca1f240fcb6?q=80&w=800",
    description: "Mescid-i Nebevi'nin hemen guneybatisinda yer alir. Peygamberimizin bayram ve yagmur duasi namazlarini kildirdigi, basinin ustunde onu golgeleyenlerin bir bulutun belirdigi rivayet edilen yerdir.",
    highlights: [
      "Bayram namazlari burada kilindi",
      "Yagmur duasi mescidi",
      "Bulut mucizesi rivayeti",
      "Osmanli donemi mimarisi"
    ],
    tips: [
      "Mescid-i Nebevi ziyaretinde ugrayin",
      "Namaz kilabilirsiniz",
      "Tarihi atmosferi yasayin"
    ],
    duration: "15-20 dakika",
    category: "Tarihi Mescit"
  }
]

// Diger Mekanlar - Tarihi ve Kulturel Gezi Rotalari
const digerPlaces = [
  {
    id: "saat-kulesi",
    title: "Mekke Saat Kulesi Muzesi",
    subtitle: "Clock Tower Museum",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800",
    description: "Ebrac el-Beyt kulelerinin en tepesinde yer alir. Hem Kabe'yi kusbakisi devasa bir yukseklikten izleme imkani sunar hem de evren, gunes sistemi ve zaman olcumleri uzerine etkileyici bir astronomi muzesidir. Dunyanin en yuksek saat kulesinden essiz manzara.",
    highlights: [
      "Kabe'yi kusbakisi gorme imkani",
      "Astronomi ve evren sergisi",
      "Gunes sistemi modelleri",
      "Zaman olcumu tarihi",
      "Dunyanin en buyuk saat kadrani"
    ],
    tips: [
      "Biletleri onceden alin",
      "Kalabalik saatlerden kacinin",
      "Fotograf makinenizi unutmayin",
      "En az 2 saat ayirin"
    ],
    duration: "2-3 saat",
    category: "Muze"
  },
  {
    id: "kisve-fabrikasi",
    title: "Kabe Ortusu (Kisve) Fabrikasi",
    subtitle: "Geleneksel Sanat Atolyesi",
    image: "https://images.unsplash.com/photo-1608226017106-25916eec28da?q=80&w=800",
    description: "Her yil arife gunu degistirilen Kabe ortusunun saf ipekten ve altin/gumus sirmalardan nasil dokuldugunu gorebileceginiz ozel bir atolyedir. Ustalar el isciligyle Kuran ayetlerini altin ipliklerle nakis isler. Onceden randevu veya tur sirketleriyle gidilmesi gerekebilir.",
    highlights: [
      "Saf ipek dokuma sureci",
      "Altin ve gumus sirma isleme",
      "El yazisi Kuran ayetleri nakisi",
      "Geleneksel Islami sanat",
      "670 kg saf ipek kullanimi"
    ],
    tips: [
      "Onceden randevu alin",
      "Tur sirketi ile gitmeniz onerillr",
      "Fotograf izni sorun",
      "Sabah saatleri daha uygun"
    ],
    duration: "1-2 saat",
    category: "Kulturel Mekan"
  },
  {
    id: "mimari-muzesi",
    title: "Iki Kutsal Mescit Mimari Muzesi",
    subtitle: "Tarihi Eserler Hazinesi",
    image: "https://images.unsplash.com/photo-1623824362141-80e3288b2a37?q=80&w=800",
    description: "Mescid-i Haram ve Mescid-i Nebevi'nin eski kapilari, kitabeleri, Kabe'nin eski ahsap merdivenleri ve tarihi zemzem kuyusu bileziklerinin sergilendigi cok ozel bir muzedir. Kutsal mekanlarin yuzyillar boyunca gecirdigi degisimleri izleyebilirsiniz.",
    highlights: [
      "Tarihi mescit kapilari",
      "Osmanli donemi kitabeler",
      "Kabe'nin eski ahsap merdiveni",
      "Zemzem kuyusu bilezikleri",
      "Nadir tarihi eserler"
    ],
    tips: [
      "Rehber esliginde gezin",
      "Detayli aciklamalari okuyun",
      "Tarihi bilgiyle gidin",
      "Fotografa izin var mi sorun"
    ],
    duration: "1-2 saat",
    category: "Muze"
  },
  {
    id: "hicaz-demiryolu",
    title: "Hicaz Demiryolu Muzesi",
    subtitle: "Osmanli Mirasi",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800",
    description: "II. Abdulhamid tarafindan yaptirilan ve Osmanli'nin son buyuk projelerinden olan Hicaz Demiryolu'nun Medine istasyonudur. Restore edilen trenleri ve Osmanli mimarisini gormek mumkundur. Istanbul'dan Medine'ye uzanan bu tarihi hat, Osmanli-Islam baglantisini simgeler.",
    highlights: [
      "II. Abdulhamid donemi projesi",
      "Restore edilmis buhali trenler",
      "Osmanli mimarisi istasyon binasi",
      "Tarihi fotograflar ve belgeler",
      "Istanbul-Sam-Medine hatti"
    ],
    tips: [
      "Medine ziyaretinize ekleyin",
      "Tarihi tren vagonlarini gezer",
      "Osmanli donemi hakkinda bilgi edinin",
      "Fotograf icin ideal mekan"
    ],
    duration: "1-2 saat",
    category: "Muze"
  },
  {
    id: "dar-al-madinah",
    title: "Dar Al Madinah Muzesi",
    subtitle: "Medine Tarihi Canlandirmasi",
    image: "https://images.unsplash.com/photo-1608226017106-25916eec28da?q=80&w=800",
    description: "Peygamber efendimiz donemindeki Medine'nin maketlerle, topografik haritalarla ve tarihi eserlerle cok detayli bir sekilde anlatildigi, sehrin tarihsel gelisimini gosteren mukemmel bir muzedir. Medine'nin 1400 yillik donusumunu izleyebilirsiniz.",
    highlights: [
      "Peygamber donemi Medine maketi",
      "Topografik haritalar",
      "Interaktif sergiler",
      "Tarihsel gelisim animasyonlari",
      "Nadir tarihi eserler"
    ],
    tips: [
      "En az 2 saat ayirin",
      "Sesli rehber kullanin",
      "Cocuklar icin egitici",
      "Mescid-i Nebevi ziyareti oncesi ideal"
    ],
    duration: "2-3 saat",
    category: "Muze"
  },
  {
    id: "taif",
    title: "Taif",
    subtitle: "Dag Sehri",
    image: "https://images.unsplash.com/photo-1623824362141-80e3288b2a37?q=80&w=800",
    description: "Mekke'ye yakin dag sehri. Peygamberimizin Islam'i teblig icin gittigi ve zor gunler yasadigi yerdir. Serin iklimi ve gul bahceleriyle unludur. Abdullah bin Abbas'in kabri buradadir. Addas isimli kole burada Musluman olmustur.",
    highlights: [
      "Peygamberimizin teblig yolculugu",
      "Abdullah bin Abbas'in kabri",
      "Gul bahceleri ve gul suyu",
      "Serin dag iklimi",
      "Addas'in Musluman oldugu yer"
    ],
    tips: [
      "Mekke'den gunubirlik gidilebilir",
      "Gul suyu ve bal alin",
      "Uzum bahcelerini gezin",
      "Sicaktan kacinmak icin ideal"
    ],
    duration: "Yarim gun - 1 gun",
    category: "Tarihi Sehir"
  },
  {
    id: "genel",
    title: "Kutsal Topraklar Rehberi",
    subtitle: "Manevi Yolculuk",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800",
    description: "Hac ve Umre yolculugu, sadece belirli mekanlari ziyaret etmek degil, ayni zamanda ruhani bir donusumu ve Allah'a yakinlasmayi temsil eder. Her adim, her dua ve her an bu kutsal topraklarda ozel bir anlam tasir. Bu yolculuk, bir omur boyu suren manevi bir tecrubedir.",
    highlights: [
      "Manevi arinma ve tecdid-i iman",
      "Sabir ve sukur dersleri",
      "Ummet birligi ve kardeslik",
      "Ruhani donusum",
      "Allah'a yakinlik"
    ],
    tips: [
      "Niyetinizi saf tutun",
      "Sabirli olun",
      "Bol bol dua edin",
      "Her ani degerlendirin",
      "Donuste hayatiniza yansitim"
    ],
    duration: "Omur boyu",
    category: "Manevi Rehber"
  }
]

type Place = typeof mekkePlaces[0]

const categories = [
  { id: "mekke", label: "Mekke-i Mukerreme", icon: Compass, places: mekkePlaces, color: "from-amber-500 to-amber-600", description: "Hac ve Umre ibadetlerinin merkezi" },
  { id: "medine", label: "Medine-i Munevvere", icon: Star, places: medinePlaces, color: "from-emerald-500 to-emerald-600", description: "Peygamberimizin sehri" },
  { id: "diger", label: "Diger Mekanlar", icon: Mountain, places: digerPlaces, color: "from-slate-500 to-slate-600", description: "Tarihi ve manevi yerler" },
]

export default function SanalTurPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [direction, setDirection] = useState(0)

  const currentPlace = activeCategory.places[currentIndex]

  const goToNext = useCallback(() => {
    setDirection(1)
    setImageLoaded(false)
    if (currentIndex < activeCategory.places.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      const categoryIndex = categories.findIndex(c => c.id === activeCategory.id)
      if (categoryIndex < categories.length - 1) {
        setActiveCategory(categories[categoryIndex + 1])
        setCurrentIndex(0)
      } else {
        setActiveCategory(categories[0])
        setCurrentIndex(0)
      }
    }
  }, [currentIndex, activeCategory])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setImageLoaded(false)
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      const categoryIndex = categories.findIndex(c => c.id === activeCategory.id)
      if (categoryIndex > 0) {
        const prevCategory = categories[categoryIndex - 1]
        setActiveCategory(prevCategory)
        setCurrentIndex(prevCategory.places.length - 1)
      } else {
        const lastCategory = categories[categories.length - 1]
        setActiveCategory(lastCategory)
        setCurrentIndex(lastCategory.places.length - 1)
      }
    }
  }, [currentIndex, activeCategory])

  const goToPlace = (categoryId: string, index: number) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      setActiveCategory(category)
      setCurrentIndex(index)
      setShowGrid(false)
      setImageLoaded(false)
    }
  }

  useEffect(() => {
    if (isAutoPlay) {
      const timer = setInterval(goToNext, 8000)
      return () => clearInterval(timer)
    }
  }, [isAutoPlay, goToNext])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "ArrowLeft") goToPrev()
      if (e.key === " ") {
        e.preventDefault()
        setIsAutoPlay(!isAutoPlay)
      }
      if (e.key === "Escape") {
        setShowInfo(false)
        setShowGrid(false)
      }
      if (e.key === "i") setShowInfo(!showInfo)
      if (e.key === "g") setShowGrid(!showGrid)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrev, isAutoPlay, showInfo, showGrid])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    })
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950">
      {/* Background Image with Ken Burns */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`${activeCategory.id}-${currentIndex}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, ease: "linear" }}
            className="absolute inset-0"
          >
            <Image
              src={currentPlace.image}
              alt={currentPlace.title}
              fill
              className={cn(
                "object-cover transition-opacity duration-700",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />
        </motion.div>
      </AnimatePresence>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between p-4 md:p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <span className="text-white font-semibold">Umrebuldum</span>
              <span className="text-white/60 text-sm ml-2">Sanal Tur</span>
            </div>
          </Link>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-1 md:p-1.5 border border-white/20">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category)
                  setCurrentIndex(0)
                  setImageLoaded(false)
                }}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300",
                  activeCategory.id === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <category.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
            >
              <Grid3X3 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
            >
              <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={cn(
                "w-9 h-9 md:w-10 md:h-10 rounded-xl backdrop-blur-md border transition-all",
                isAutoPlay 
                  ? "bg-amber-500 border-amber-400 text-white" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              )}
            >
              {isAutoPlay ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-8">
        <div className="max-w-4xl">
          {/* Category Badge */}
          <motion.div
            key={`badge-${activeCategory.id}-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 md:mb-4"
          >
            <span className={cn(
              "inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r",
              activeCategory.color,
              "text-white shadow-lg"
            )}>
              <activeCategory.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {activeCategory.label}
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60" />
              <span className="opacity-80">{currentPlace.category}</span>
            </span>
          </motion.div>

          {/* Title & Subtitle */}
          <motion.div
            key={`title-${activeCategory.id}-${currentIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-2 md:mb-3 leading-tight text-balance">
              {currentPlace.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-amber-400 font-medium mb-3 md:mb-4">
              {currentPlace.subtitle}
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            key={`desc-${activeCategory.id}-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-4 md:mb-6 line-clamp-3"
          >
            {currentPlace.description}
          </motion.p>

          {/* Quick Info */}
          <motion.div
            key={`info-${activeCategory.id}-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6"
          >
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
              <span className="text-white text-xs md:text-sm">{currentPlace.duration}</span>
            </div>
            <button 
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
              <span className="text-white text-xs md:text-sm">Detayli Bilgi</span>
            </button>
          </motion.div>

          {/* Progress & Navigation */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrev}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-1 overflow-x-auto pb-2 scrollbar-hide">
              {activeCategory.places.map((place, idx) => (
                <button
                  key={place.id}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                    setImageLoaded(false)
                  }}
                  className={cn(
                    "flex-shrink-0 h-1 md:h-1.5 rounded-full transition-all duration-300",
                    idx === currentIndex 
                      ? "w-6 md:w-8 bg-amber-400" 
                      : "w-1 md:w-1.5 bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>

            {/* Counter */}
            <div className="text-white/60 text-xs md:text-sm font-medium whitespace-nowrap">
              {currentIndex + 1} / {activeCategory.places.length}
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              onClick={() => setShowInfo(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl z-40 overflow-y-auto border-l border-white/10"
            >
              <div className="p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 md:mb-8">
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r mb-2",
                      activeCategory.color,
                      "text-white"
                    )}>
                      {currentPlace.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-white">{currentPlace.title}</h2>
                    <p className="text-amber-400 mt-1">{currentPlace.subtitle}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInfo(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Image */}
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 md:mb-8">
                  <Image
                    src={currentPlace.image}
                    alt={currentPlace.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Description */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    Hakkinda
                  </h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">{currentPlace.description}</p>
                </div>

                {/* Highlights */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    One Cikan Ozellikler
                  </h3>
                  <ul className="space-y-2 md:space-y-3">
                    {currentPlace.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 md:gap-3 text-white/80 text-sm md:text-base">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400" />
                        </div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    Ziyaret Ipuclari
                  </h3>
                  <ul className="space-y-2 md:space-y-3">
                    {currentPlace.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 md:gap-3 text-white/80 text-sm md:text-base">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] md:text-xs text-emerald-400 font-semibold">{idx + 1}</span>
                        </div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Duration */}
                <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs md:text-sm">Tavsiye Edilen Sure</p>
                      <p className="text-white font-semibold text-sm md:text-base">{currentPlace.duration}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Grid View */}
      <AnimatePresence>
        {showGrid && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-30"
              onClick={() => setShowGrid(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-2 md:inset-4 lg:inset-8 z-40 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8 sticky top-0 bg-slate-950/80 backdrop-blur-lg py-3 md:py-4 -mx-2 px-2 md:-mx-4 md:px-4 z-10">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white">Tum Mekanlar</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowGrid(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </Button>
                </div>

                {/* Categories */}
                {categories.map((category) => (
                  <div key={category.id} className="mb-8 md:mb-12">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                      <div className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-gradient-to-r",
                        category.color
                      )}>
                        <category.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-white">{category.label}</h3>
                        <p className="text-white/60 text-xs md:text-sm">{category.places.length} mekan - {category.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                      {category.places.map((place, idx) => (
                        <motion.button
                          key={place.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => goToPlace(category.id, idx)}
                          className={cn(
                            "group relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-300",
                            activeCategory.id === category.id && currentIndex === idx
                              ? "border-amber-400 ring-2 ring-amber-400/30"
                              : "border-transparent hover:border-white/30"
                          )}
                        >
                          <Image
                            src={place.image}
                            alt={place.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                            <p className="text-white font-medium text-xs md:text-sm line-clamp-1">{place.title}</p>
                            <p className="text-white/60 text-[10px] md:text-xs line-clamp-1">{place.subtitle}</p>
                          </div>
                          {activeCategory.id === category.id && currentIndex === idx && (
                            <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Keyboard Hints */}
      <div className="absolute bottom-4 right-4 z-10 hidden lg:flex items-center gap-4 text-white/40 text-xs">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20">{"<-"}</kbd>
          <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20">{"->"}</kbd>
          <span>Gezin</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20">Space</kbd>
          <span>Otomatik</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20">G</kbd>
          <span>Galeri</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20">I</kbd>
          <span>Bilgi</span>
        </span>
      </div>
    </div>
  )
}
