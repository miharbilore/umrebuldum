import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageSquare, HeadphonesIcon } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "İletişim | Umrebuldum",
    description:
      "Umrebuldum ile iletişime geçin. Kullanıcılar ve acenteler için 7/24 destek hattımız, e-posta adreslerimiz ve ofis bilgilerimiz.",
    openGraph: {
      title: "İletişim | Umrebuldum",
      description:
        "Umrebuldum ile iletişime geçin. Kullanıcılar ve acenteler için 7/24 destek hattımız, e-posta adreslerimiz ve ofis bilgilerimiz.",
    },
  };
}

const contactInfo = [
  {
    icon: Phone,
    title: "Müşteri Hizmetleri",
    content: "0850 123 45 67",
    desc: "7/24 Canlı Destek ve WhatsApp hattı",
    href: "tel:+908501234567",
  },
  {
    icon: Mail,
    title: "Kurumsal E-posta",
    content: "destek@umrebuldum.com",
    desc: "Acente kayıtları ve resmi yazışmalar için",
    href: "mailto:destek@umrebuldum.com",
  },
  {
    icon: MapPin,
    title: "Genel Merkez",
    content: "Bilişim Vadisi, İstanbul",
    desc: "Teknoloji Geliştirme Bölgesi No:1",
    href: null,
  },
  {
    icon: Clock,
    title: "Çalışma Saatleri",
    content: "Hafta İçi: 09:00 - 18:00",
    desc: "Cumartesi - Pazar: Kapalı (Canlı Destek Hariç)",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <HeadphonesIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Bize Ulaşın
          </h1>
          <p className="text-xl text-muted-foreground text-pretty lg:text-2xl">
            Acentelerimiz, turlarımız veya platform kullanımına dair tüm soru, görüş ve önerileriniz için profesyonel destek ekibimiz yanınızda.
          </p>
        </div>

        {/* Content */}
        <div className="mt-20 grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Contact Form */}
          <Card className="p-4 sm:p-6 shadow-lg border-primary/10">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl lg:text-3xl m-0">Mesaj Gönderin</CardTitle>
              </div>
              <p className="text-muted-foreground">Formu doldurun, yetkili uzmanımız size en kısa sürede dönüş yapsın.</p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ContactForm />
            </CardContent>
          </Card>

          {/* Contact Info & Support Links */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((item) => (
                <div key={item.title} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-lg font-semibold text-primary hover:underline block mb-1">
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-lg font-semibold text-foreground mb-1">{item.content}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Support Call To Actions */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 border border-primary/20 mt-8">
              <h3 className="text-2xl font-bold mb-3">Satış ve Destek Merkezi</h3>
              <p className="text-muted-foreground mb-6">
                Mevcut tur rezervasyonlarınızın durumunu öğrenmek veya acentenizle yaşadığınız bir uyuşmazlığı bildirmek için Yardım Merkezimizi ziyaret edebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/help">Yardım Merkezine Git</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1 bg-white dark:bg-transparent">
                  <Link href="/faq">Sık Sorulan Sorular</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
