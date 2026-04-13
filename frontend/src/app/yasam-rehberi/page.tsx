"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useInView, Variants } from "framer-motion"
import { 
  ShoppingBag, 
  Smartphone, 
  UtensilsCrossed, 
  Heart, 
  ChevronRight,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Footprints,
  ThermometerSun,
  Pill,
  ArrowLeft,
  Store,
  Building2,
  Car,
  Package,
  Calendar,
  Utensils,
  Coffee,
  Soup,
  GlassWater,
  Stethoscope,
  ShieldCheck,
  BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Category data
const categories = [
  {
    id: "alisveris",
    title: "Alisveris Rehberi",
    subtitle: "Geleneksel ve Modern",
    icon: ShoppingBag,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200"
  },
  {
    id: "uygulamalar",
    title: "Dijital Asistanlar",
    subtitle: "Hayat Kurtaran Uygulamalar",
    icon: Smartphone,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200"
  },
  {
    id: "yemek",
    title: "Yeme-Icme",
    subtitle: "Lezzetler ve Tavsiyeler",
    icon: UtensilsCrossed,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200"
  },
  {
    id: "saglik",
    title: "Saglik Rehberi",
    subtitle: "Onlem ve Bakim",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200"
  }
]

// Shopping data
const shoppingData = {
  traditional: [
    {
      title: "Merkezi Hurma Pazari (Souq Al Tumoour)",
      location: "Medine",
      description: "Hurma alisverisi icin en ideal yer. Acve, Safavi, Mebrum, Sugai en cok tercih edilen turlerdir.",
      icon: Store,
      tips: ["Taze hurmalari tercih edin", "Fiyat karsilastirmasi yapin", "Toptan alimda indirim isteyin"]
    },
    {
      title: "Otel Alti Carsilari",
      location: "Mekke",
      description: "Seccade, tesbih, misvak ve ud/misk kokulari icin ideal. Otellerin altindaki carsilarda genis cesit bulunur.",
      icon: Store,
      tips: ["Pazarlik yapilabilir", "Kaliteli misvak secin", "Ud yagi orijinalligini kontrol edin"]
    }
  ],
  modern: [
    {
      title: "Abraj Al Bait Mall",
      location: "Mekke - Kabe Karsisi",
      description: "Kabe'nin hemen karsisindaki devasa AVM. Giyimden elektroniğe her sey mevcut.",
      icon: Building2,
      features: ["Uluslararasi markalar", "Yeme-icme alanlari", "Klimalı ortam"]
    },
    {
      title: "Taiba Commercial Center",
      location: "Medine",
      description: "Medine'nin en buyuk alisveris merkezi. Genis urun yelpazesi.",
      icon: Building2,
      features: ["Yerel ve global markalar", "Supermarketler", "Elektronik magazalari"]
    }
  ]
}

// Apps data
const appsData = [
  {
    name: "Nusuk",
    category: "Resmi Uygulama",
    description: "Ravza-i Mutahhara randevulari ve umre izinleri icin zorunlu resmi uygulamadir.",
    importance: "Zorunlu",
    icon: Calendar,
    color: "bg-emerald-500"
  },
  {
    name: "Careem / Uber",
    category: "Ulasim",
    description: "Taksilerle pazarlik yapmak yerine sabit fiyatla guvenli ulasim saglar. Mutlaka telefonunuzda bulunmalidir.",
    importance: "Cok Onemli",
    icon: Car,
    color: "bg-blue-500"
  },
  {
    name: "Noon / Amazon KSA",
    category: "E-Ticaret",
    description: "Suudi Arabistan'in en buyuk e-ticaret siteleri. Unuttugunuz veya acil ihtiyac duydugunuz urunleri dogrudan otelinize siparis edebilirsiniz.",
    importance: "Tavsiye",
    icon: Package,
    color: "bg-orange-500"
  },
  {
    name: "HungerStation / Jahez",
    category: "Yemek Siparisi",
    description: "Tum restoranlardan (Turk restoranlari dahil) bulundugunuz otele yemek siparisi verebilirsiniz.",
    importance: "Tavsiye",
    icon: Utensils,
    color: "bg-rose-500"
  }
]

// Food data
const foodData = {
  mustTry: [
    {
      name: "Al Baik",
      type: "Fast Food",
      description: "Suudi Arabistan'in efsanevi 'broasted' (basincli fritozde kizartilmis) tavuk zinciri. Onunde uzun kuyruklar olur, mutlaka denenmeli!",
      icon: Utensils,
      price: "Ekonomik",
      rating: 4.8
    },
    {
      name: "Mandi / Kabsa",
      type: "Yoresel",
      description: "Et ve pirinçle yapilan geleneksel Arap yemegi. Aromatik baharatlarla pisirilen lezzetli pilav ve yumusak et.",
      icon: Soup,
      price: "Orta",
      rating: 4.7
    },
    {
      name: "Mutabbaq",
      type: "Kahvalti",
      description: "Ici dolgulu ince hamur isi. Sabah kahvaltilarinda yoresel lezzetleri denemek isteyenler icin ideal.",
      icon: Coffee,
      price: "Ekonomik",
      rating: 4.5
    }
  ],
  water: {
    title: "Su Tuketimi",
    warning: "Cesme suyu icilmemelidir!",
    tips: [
      "Mescitlerdeki klimali soguk veya normal oda sicakligindaki Zemzem bidonlarindan bol bol su tuketin",
      "'Not Cold' yazan bidonlar oda sicakligindadir",
      "Disarida kapali sise sular (Makkah Water, Nova vb.) cok ucuza satilmaktadir"
    ]
  }
}

// Health data
const healthData = {
  sections: [
    {
      title: "Ayak Sagligi",
      icon: Footprints,
      color: "bg-blue-500",
      description: "Tavaf ve Sa'y ibadetleri ile otel-mescit arasi yuruyusler gunde 15-20 bin adimi bulur.",
      items: [
        "Iyi bir nemlendirici krem bulundurun",
        "Pisik kremi mutlaka yanınızda olsun",
        "Vazelin ayak catlaklari icin etkilidir",
        "Rahat ve yuruyuse uygun ayakkabi secin"
      ]
    },
    {
      title: "Ust Solunum Yollari",
      icon: ThermometerSun,
      color: "bg-orange-500",
      description: "'Umre oksurugu' meşhurdur. Dunyanin her yerinden gelen milyonlarca insan ve yogun klima kullanimi buna neden olur.",
      items: [
        "Kalabalik alanlarda maske takin",
        "Yaninizda bogaz pastili bulundurun",
        "Terliyken dogrudan klimaya maruz kalmayin",
        "Bol su icin ve bogazi nemli tutun"
      ]
    },
    {
      title: "Saglik Hizmetleri",
      icon: Stethoscope,
      color: "bg-emerald-500",
      description: "Mescid-i Haram ve Mescid-i Nebevi'nin etrafinda acil durumlar icin ucretsiz hizmet veren devlet saglik merkezleri bulunur.",
      items: [
        "Nahdi veya Al-Dawaa eczaneleri her kose basinda mevcut",
        "Eczacilar Ingilizce bilmektedir",
        "Temel ilaclari kolayca temin edebilirsiniz",
        "Receteli ilaclarinizi yedekli olarak goturun"
      ]
    }
  ]
}

// Animated section component
function AnimatedSection({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function YasamRehberiPage() {
  const [activeCategory, setActiveCategory] = useState("alisveris")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const currentCategory = categories.find(c => c.id === activeCategory)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1565552643534-114eeffb1a20?q=80&w=1200"
          alt="Kutsal Topraklar"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Pratik Bilgiler</span>
            </motion.div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-balance">
              Umre Yasam Rehberi
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto text-pretty">
              Kutsal topraklardaki gunluk yasami kolaylastiracak pratik bilgiler, 
              uygulamalar ve tavsiyeler
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* Category Navigation */}
      <section className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg border-b" : "bg-background"
      )}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-4 md:px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0",
                    isActive 
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg` 
                      : `${category.bgColor} ${category.textColor} hover:shadow-md`
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm md:text-base">{category.title}</div>
                    <div className={cn(
                      "text-xs hidden md:block",
                      isActive ? "text-white/80" : "opacity-70"
                    )}>
                      {category.subtitle}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Shopping Section */}
          {activeCategory === "alisveris" && (
            <motion.div
              key="alisveris"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedSection>
                {/* Section Header */}
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Alisveris ve E-Alisveris
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Geleneksel carsılardan modern AVM'lere, ihtiyaciniz olan her seyi bulabilirsiniz
                  </p>
                </motion.div>

                {/* Hero Image */}
                <motion.div variants={fadeInUp} className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-12">
                  <Image
                    src="https://images.unsplash.com/photo-1555529771-835f59fc5ea3?q=80&w=800"
                    alt="Alisveris"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Geleneksel Lezzetler & Hediyeler</h3>
                    <p className="text-white/80">Hurma, misvak, tesbih ve daha fazlasi</p>
                  </div>
                </motion.div>

                {/* Traditional Shopping */}
                <motion.div variants={fadeInUp} className="mb-12">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-600" />
                    Geleneksel Alisveris
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {shoppingData.traditional.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ y: -4 }}
                        className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                            <div className="space-y-1">
                              {item.tips.map((tip, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span className="text-foreground/80">{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Modern Shopping */}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Modern AVM'ler
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {shoppingData.modern.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {item.features.map((feature, i) => (
                                <span 
                                  key={i} 
                                  className="px-3 py-1 bg-white rounded-full text-xs font-medium text-blue-700"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatedSection>
            </motion.div>
          )}

          {/* Apps Section */}
          {activeCategory === "uygulamalar" && (
            <motion.div
              key="uygulamalar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedSection>
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Dijital Asistanlar
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Hayatinizi kolaylastiracak ve yolculugunuzu daha konforlu hale getirecek uygulamalar
                  </p>
                </motion.div>

                {/* Hero Image */}
                <motion.div variants={fadeInUp} className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-12">
                  <Image
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800"
                    alt="Uygulamalar"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Akilli Telefon Esliginizde</h3>
                    <p className="text-white/80">Ulasim, randevu ve siparis bir tik uzaginizda</p>
                  </div>
                </motion.div>

                {/* Apps Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {appsData.map((app, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                          app.color
                        )}>
                          <app.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg text-foreground">{app.name}</h4>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              app.importance === "Zorunlu" 
                                ? "bg-red-100 text-red-700" 
                                : app.importance === "Cok Onemli"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            )}>
                              {app.importance}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">{app.category}</div>
                          <p className="text-foreground/80">{app.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pro Tips */}
                <motion.div variants={fadeInUp} className="mt-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
                  <h3 className="font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-indigo-600" />
                    Pro Ipuclari
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">Tum uygulamalari Turkiye'deyken indirin ve test edin</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">Nusuk uygulamasina Turkce numara ile kayit olabilirsiniz</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">Careem/Uber icin uluslararasi odeme yontemini aktif edin</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">Internet paketi icin yerel SIM kart alin veya eSIM kullanin</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            </motion.div>
          )}

          {/* Food Section */}
          {activeCategory === "yemek" && (
            <motion.div
              key="yemek"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedSection>
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Yeme-Icme Rehberi
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Yoresel lezzetlerden ekonomik secimlere, kutsal topraklarin mutfagi
                  </p>
                </motion.div>

                {/* Hero Image */}
                <motion.div variants={fadeInUp} className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-12">
                  <Image
                    src="https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800"
                    alt="Yemek"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Arap Mutfagi Lezzetleri</h3>
                    <p className="text-white/80">Kabsa, Mandi ve daha fazlasi</p>
                  </div>
                </motion.div>

                {/* Must Try Foods */}
                <motion.div variants={fadeInUp} className="mb-12">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Mutlaka Denenecekler
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {foodData.mustTry.map((food, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ y: -4 }}
                        className="bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <food.icon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{food.rating}</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-lg text-foreground mb-1">{food.name}</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{food.type}</span>
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{food.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{food.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Water Section */}
                <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1616421422676-4740f952136d?q=80&w=800"
                    alt="Zemzem"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70" />
                  <div className="relative p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{foodData.water.title}</h3>
                    </div>
                    
                    <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0" />
                      <span className="text-white font-medium">{foodData.water.warning}</span>
                    </div>

                    <div className="space-y-3">
                      {foodData.water.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <p className="text-white/90">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            </motion.div>
          )}

          {/* Health Section */}
          {activeCategory === "saglik" && (
            <motion.div
              key="saglik"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedSection>
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Saglik ve Onlem
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Yolculugunuzu saglikli gecirmek icin dikkat edilmesi gerekenler
                  </p>
                </motion.div>

                {/* Hero Image */}
                <motion.div variants={fadeInUp} className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-12">
                  <Image
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800"
                    alt="Saglik"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Saglikli Bir Yolculuk</h3>
                    <p className="text-white/80">Onlem almak tedavi etmekten iyidir</p>
                  </div>
                </motion.div>

                {/* Health Sections */}
                <div className="space-y-6">
                  {healthData.sections.map((section, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="bg-card rounded-2xl border overflow-hidden"
                    >
                      <div className={cn("h-2", section.color)} />
                      <div className="p-6 md:p-8">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                            section.color
                          )}>
                            <section.icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{section.title}</h3>
                            <p className="text-muted-foreground">{section.description}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {section.items.map((item, i) => (
                            <div 
                              key={i} 
                              className="flex items-start gap-3 bg-muted/50 rounded-lg p-4"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground/80">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Emergency Info */}
                <motion.div variants={fadeInUp} className="mt-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
                  <h3 className="font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-rose-600" />
                    Acil Durum Bilgileri
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-foreground mb-1">Acil Yardim</div>
                      <div className="text-2xl font-bold text-rose-600">911</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-foreground mb-1">Ambulans</div>
                      <div className="text-2xl font-bold text-rose-600">997</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-foreground mb-1">Trafik Kazasi</div>
                      <div className="text-2xl font-bold text-rose-600">993</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Daha Fazla Bilgi Edinin
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Sanal turumuzla kutsal mekanlari kesfetmeye devam edin
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sanal-tur">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                Sanal Tur
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Umre Turlari
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
