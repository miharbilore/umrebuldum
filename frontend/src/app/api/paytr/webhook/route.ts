import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import type { PackageTier } from '@/../prisma/generated-client';

export async function POST(req: Request) {
  try {
    // PayTR webhook verilerini form-data olarak gönderir
    const formData = await req.formData();
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;

    const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

    // 1. Güvenlik: Gelen verinin PayTR'dan geldiğini doğrula (Hash Check)
    const hash_str = merchant_oid + merchant_salt + status + total_amount;
    const generated_hash = crypto.createHmac('sha256', merchant_key).update(hash_str).digest('base64');

    if (hash !== generated_hash) {
      console.error("PayTR Webhook Yetkisiz Erişim (Hash Uyumsuzluğu)");
      return new NextResponse('HASH FAILED', { status: 400 });
    }

    // 2. İşlemi DB'de Bul
    const transaction = await prisma.transaction.findFirst({
      where: { sessionId: merchant_oid }
    });

    if (!transaction) return new NextResponse('OK', { status: 200 }); // İşlem yoksa PayTR'ı sustur

    // 3. Başarılı Ödeme Mantığı
    if (status === 'success') {
      // Transaction'ı güncelle
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });

      // Kullanıcının paketini güncelle
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          packageType: 'PRO' as PackageTier, // Dinamikleştirilebilir
          tokenBalance: { increment: 100 }
        }
      });
    } else {
      // Ödeme başarısız
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' }
      });
    }

    // PayTR her zaman 200 OK metnini görmek ister, yoksa isteği tekrarlar
    return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error("Webhook İşleme Hatası:", error);
    return new NextResponse('OK', { status: 200 }); // Hata olsa bile OK dön ki PayTR spam atmasın
  }
}
