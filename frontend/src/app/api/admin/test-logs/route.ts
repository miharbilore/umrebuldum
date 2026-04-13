import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'ALL';
  const search = searchParams.get('search') || '';

  try {
    // Build filter
    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { scenarioName: { contains: search } },
        { testerName: { contains: search } },
      ];
    }

    const [logs, total, success, fail, pending] = await Promise.all([
      prisma.testLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.testLog.count(),
      prisma.testLog.count({ where: { status: 'SUCCESS' } }),
      prisma.testLog.count({ where: { status: 'FAIL' } }),
      prisma.testLog.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      logs,
      stats: { total, success, fail, pending },
    });
  } catch (error) {
    console.error('[TestLogs API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow creating test logs programmatically
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { scenarioName, status, errorMessage, testerName, duration, metadata } = body;

    if (!scenarioName || !testerName) {
      return NextResponse.json(
        { error: 'scenarioName and testerName are required' },
        { status: 400 }
      );
    }

    const log = await prisma.testLog.create({
      data: {
        scenarioName,
        status: status || 'PENDING',
        errorMessage: errorMessage || null,
        testerName,
        duration: duration || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('[TestLogs API] Create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
