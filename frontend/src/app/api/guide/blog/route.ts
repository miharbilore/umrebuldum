import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getPackageFeatures } from "@/config/package-features";

/**
 * GET /api/guide/blog
 * List published guide articles. Public endpoint.
 *
 * POST /api/guide/blog
 * Create a new guide article. Requires hasBlogFeature permission.
 *
 * Body: { title, excerpt, content, coverImage, category, youtubeVideoId? }
 */

// ── GET: Public listing ─────────────────────────────────────────────────
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
        const offset = parseInt(searchParams.get("offset") || "0");

        const where: any = { isPublished: true };
        if (category) where.category = category;

        const [articles, total] = await Promise.all([
            prisma.guideArticle.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
                include: {
                    author: {
                        select: { id: true, name: true, image: true, slug: true },
                    },
                },
            }),
            prisma.guideArticle.count({ where }),
        ]);

        return NextResponse.json({ articles, total });
    } catch (error) {
        console.error("Blog GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── POST: Create article (requires hasBlogFeature) ──────────────────────
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Resolve user with packageType
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, packageType: true, role: true },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ── Package Feature Guard: Blog yazma yetkisi ────────────────
        const features = getPackageFeatures(user.packageType);
        if (!features.hasBlogFeature) {
            return NextResponse.json({
                error: "Blog yazma özelliği mevcut paketinizde bulunmamaktadır. Lütfen paketinizi yükseltin."
            }, { status: 403 });
        }

        // Only GUIDE, ORGANIZATION, ADMIN can write blog posts
        if (!["GUIDE", "ORGANIZATION", "ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmuyor." }, { status: 403 });
        }

        const body = await req.json();
        const { title, excerpt, content, coverImage, category, youtubeVideoId } = body;

        // Validation
        if (!title || typeof title !== "string" || title.trim().length < 3) {
            return NextResponse.json({ error: "Geçerli bir başlık giriniz (en az 3 karakter)." }, { status: 400 });
        }
        if (!excerpt || typeof excerpt !== "string" || excerpt.trim().length < 10) {
            return NextResponse.json({ error: "Geçerli bir özet giriniz (en az 10 karakter)." }, { status: 400 });
        }
        if (!content || typeof content !== "string" || content.trim().length < 50) {
            return NextResponse.json({ error: "İçerik en az 50 karakter olmalıdır." }, { status: 400 });
        }
        if (!coverImage || typeof coverImage !== "string") {
            return NextResponse.json({ error: "Kapak görseli gereklidir." }, { status: 400 });
        }
        if (!category || typeof category !== "string") {
            return NextResponse.json({ error: "Kategori seçimi gereklidir." }, { status: 400 });
        }

        // Generate slug from title
        const baseSlug = title
            .toLowerCase()
            .replace(/[çÇ]/g, "c")
            .replace(/[ğĞ]/g, "g")
            .replace(/[ıİ]/g, "i")
            .replace(/[öÖ]/g, "o")
            .replace(/[şŞ]/g, "s")
            .replace(/[üÜ]/g, "u")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .substring(0, 80);

        // Ensure slug uniqueness
        const existingSlug = await prisma.guideArticle.findUnique({ where: { slug: baseSlug } });
        const slug = existingSlug ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

        const article = await prisma.guideArticle.create({
            data: {
                slug,
                title: title.trim(),
                excerpt: excerpt.trim().substring(0, 500),
                content: content.trim(),
                coverImage,
                category: category.toUpperCase(),
                youtubeVideoId: youtubeVideoId?.trim() || null,
                authorId: user.id,
                isPublished: false, // Draft by default — admin approval needed
            },
        });

        console.log(`[Blog] User ${user.id} created article "${slug}" (packageType: ${user.packageType})`);

        return NextResponse.json({
            message: "Makale başarıyla oluşturuldu. Yayınlanmadan önce admin onayı gereklidir.",
            article: { id: article.id, slug: article.slug },
        }, { status: 201 });

    } catch (error) {
        console.error("Blog POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
