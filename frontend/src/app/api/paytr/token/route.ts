import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserRole } from "@/../prisma/generated-client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, price, packageName } = body;

    // 1. PayTR Ayarları (.env'den alınacak)
    const merchant_id = process.env.PAYTR_MERCHANT_ID!;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

    // 2. Sipariş Detayları
    const merchant_oid = `TR-${Date.now()}`; // Benzersiz sipariş numarası
    const user_ip = req.headers.get('x-forwarded-for') || '85.105.105.105'; // Test IP
    const user_basket = Buffer.from(JSON.stringify([[packageName, price, 1]])).toString('base64');
    const payment_amount = price * 100; // PayTR kuruş cinsinden çalışır

    // 3. DB Kaydı (İşlemi PENDING olarak kaydet)
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        sessionId: merchant_oid,
        amountTRY: price,
        provider: 'PAYTR',
        status: 'PENDING',
        credits: 0,
        role: (session.user.role as UserRole) || UserRole.GUIDE
      }
    });

    // 4. Hash (Token) Oluşturma Matematiği
    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${session.user.email}${payment_amount}${user_basket}00TRY0`;
    const paytr_token = crypto.createHmac('sha256', merchant_key).update(hash_str + merchant_salt).digest('base64');

    // 5. PayTR'a İstek Atma
    const formData = new URLSearchParams({
      merchant_id,
      user_ip,
      merchant_oid,
      email: session.user.email,
      payment_amount: payment_amount.toString(),
      paytr_token,
      user_basket,
      debug_on: '1',
      no_installment: '0',
      max_installment: '0',
      user_name: session.user.name || 'Umrebuldum Kullanıcısı',
      user_address: 'Türkiye',
      user_phone: '05555555555',
      merchant_ok_url: `${process.env.NEXTAUTH_URL}/dashboard/billing/success`,
      merchant_fail_url: `${process.env.NEXTAUTH_URL}/dashboard/billing/fail`,
      timeout_limit: '30',
      currency: 'TRY',
      test_mode: '1' // Canlıda 0 yapılacak
    });

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const result = await response.json();

    if (result.status === 'success') {
      return NextResponse.json({ token: result.token });
    } else {
      console.error("PayTR Token Hatası:", result.reason);
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

  } catch (error) {
    console.error("Ödeme başlatma hatası:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
