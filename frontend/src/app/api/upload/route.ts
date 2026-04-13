import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/api-guards";
import { rateLimit } from "@/lib/rate-limit";
import { safeErrorMessage } from "@/lib/safe-error";
import { uploadToVault } from "@/lib/s3-client";

// â”€â”€ Security constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Detect actual MIME type from file magic bytes (file signature).
 * Prevents MIME type spoofing â€” e.g., a .exe renamed to .jpg.
 */
function detectMimeFromBytes(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return "image/png";
    }

    // WebP: RIFF....WEBP
    if (
        buffer[0] === 0x52 && // R
        buffer[1] === 0x49 && // I
        buffer[2] === 0x46 && // F
        buffer[3] === 0x46 && // F
        buffer[8] === 0x57 && // W
        buffer[9] === 0x45 && // E
        buffer[10] === 0x42 && // B
        buffer[11] === 0x50 // P
    ) {
        return "image/webp";
    }

    return null;
}

/** Strip path separators and keep only safe characters to prevent traversal */
function sanitizeFilename(raw: string): string {
    return path.basename(raw)          // strip any leading path components
        .replace(/[^a-zA-Z0-9._-]/g, "_") // allow only safe chars
        .substring(0, 200);            // cap length
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        // VULN-2: requireAuth blocks unauthenticated AND BANNED users
        const guard = requireAuth(session);
        if (guard) return guard;

        // Rate limit: 5 uploads per minute per user
        const rl = await rateLimit(`upload:${session!.user.email}`, 60_000, 5);
        if (!rl.success) {
            return NextResponse.json(
                { error: "Too many uploads. Please wait." },
                { status: 429, headers: { "Retry-After": "60" } }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        // VULN-8a: File type validation â€” allowlist only
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
                { status: 415 }
            );
        }

        // VULN-8b: Size limit
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5 MB." },
                { status: 413 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // VULN-8c: Deep magic-byte validation â€” prevent MIME spoofing
        const detectedType = detectMimeFromBytes(buffer);
        if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType)) {
            return NextResponse.json(
                { error: "File content does not match an allowed image format." },
                { status: 415 }
            );
        }

        // VULN-8c: Sanitize filename â€” prevent path traversal
        const sanitized = sanitizeFilename(file.name);

        // Vault Upload Branch (Private KYC)
        const intent = formData.get("intent") as string;
        if (intent === "kyc") {
            const vaultKey = `kyc/${session!.user.id}/${Date.now()}_${sanitized}`;
            await uploadToVault(vaultKey, buffer, file.type);

            return NextResponse.json({
                success: true,
                url: `vault://${vaultKey}` // Return a virtual URL that the client submits to DB
            });
        }

        // Public Upload Branch (Profile photos, etc)
        const filename = `${Date.now()}_${sanitized}`;

        // Ensure "public/uploads" exists
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Final safety: resolve and verify path stays inside uploadDir
        const filePath = path.resolve(uploadDir, filename);
        if (!filePath.startsWith(path.resolve(uploadDir))) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: safeErrorMessage(error, "Upload failed") }, { status: 500 });
    }
}
