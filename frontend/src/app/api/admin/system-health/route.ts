import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ApprovalStatus, TransactionStatus } from '@/../prisma/generated-client';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      pendingGuides,
      pendingIdentity,
      completedTransactions,
      failedTransactions,
      pendingListings,
      totalUsers,
      testFailsLast24h,
      testSuccessLast24h,
      pendingReviews,
      unreadMessages,
    ] = await Promise.all([
      // Onay bekleyen rehber başvuruları
      prisma.user.count({
        where: {
          role: 'GUIDE',
          isApproved: false,
        },
      }),
      // Kimlik doğrulama bekleyen başvurular
      prisma.identityApplication.count({
        where: { status: 'PENDING' },
      }),
      // Tamamlanmış ödeme işlemleri (Küçük harf hatası düzeltildi)
      prisma.transaction.count({
        where: { status: TransactionStatus.COMPLETED },
      }),
      // Başarısız ödeme işlemleri (Küçük harf hatası düzeltildi)
      prisma.transaction.count({
        where: { status: TransactionStatus.FAILED },
      }),
      // Onay bekleyen ilanlar
      prisma.guideListing.count({
        where: { approvalStatus: ApprovalStatus.PENDING },
      }),
      // Toplam kullanıcı
      prisma.user.count(),
      // Son 24 saat test hataları
      prisma.testLog.count({
        where: {
          status: 'FAIL',
          createdAt: { gte: last24h },
        },
      }),
      // Son 24 saat başarılı testler
      prisma.testLog.count({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: last24h },
        },
      }),
      // Bekleyen yorumlar
      prisma.review.count({
        where: { status: ApprovalStatus.PENDING },
      }),
      // Okunmamış iletişim mesajları TABLOSU SİLİNDİ, çökmemesi için 0 dönüyoruz
      Promise.resolve(0),
    ]);

    return NextResponse.json({
      pendingGuides,
      pendingIdentity,
      completedTransactions,
      failedTransactions,
      pendingListings,
      totalUsers,
      testFailsLast24h,
      testSuccessLast24h,
      pendingReviews,
      unreadMessages,
    });
  } catch (error) {
    console.error('[SystemHealth API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
