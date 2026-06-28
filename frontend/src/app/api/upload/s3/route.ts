import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/api-guards";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "eu-central-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

interface S3UploadRequest {
    filename: string;
    contentType: string;
    folder?: string;
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const guard = requireAuth(session);
        if (guard) return guard;

        const body = (await req.json()) as S3UploadRequest;
        const { filename, contentType, folder = "profiles" } = body;

        if (!filename || !contentType) {
            return NextResponse.json({ error: "Dosya bilgileri eksik" }, { status: 400 });
        }

        const extension = filename.split('.').pop();
        const safeName = `${session!.user.id}-${Date.now()}.${extension}`;
        const key = `${folder}/${safeName}`;
        const bucketName = process.env.AWS_S3_PUBLIC_BUCKET || "umrebuldum-public-assets";

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
        });

        // 5 Minutes expiration
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${key}`;

        return NextResponse.json({ signedUrl, publicUrl });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("S3 Presigned URL Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("S3 Presigned URL Error:", error);
        return NextResponse.json({ error: "Yükleme bağlantısı oluşturulamadı" }, { status: 500 });
    }
}
