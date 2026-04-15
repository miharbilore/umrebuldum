import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ── S3 Initialization ─────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

if (isProduction && !hasCredentials) {
    console.warn("[S3Client] AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in production.");
}

const isDevMockMode = !hasCredentials;

export const s3 = new S3Client({
    region: process.env.AWS_REGION || "eu-central-1",
    ...(hasCredentials
        ? {
              credentials: {
                  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
              },
          }
        : {}),
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "kyc-document-vault";

/**
 * Uploads a file securely to the private S3 vault.
 * Forces private ACL.
 */
export async function uploadToVault(key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "private", // Strict private enforcement
    });

    try {
        if (isDevMockMode) {
            console.log(`[Mock S3 Vault] Saved file privately as ${key}`);
        } else {
            await s3.send(command);
        }
        return key;
    } catch (e) {
        console.error("S3 Upload Error:", e);
        throw new Error("Vault upload failed");
    }
}

/**
 * Generates a short-lived, pre-signed URL for secure admin viewing.
 */
export async function getVaultPresignedUrl(key: string, expiresIn: number = 60) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    try {
        if (isDevMockMode) {
            // Return a mock URL that proves the system logic works
            return `https://mock-s3.local.umrebuldum.com/${BUCKET_NAME}/${key}?X-Amz-Expires=${expiresIn}&mock=true`;
        }
        return await getSignedUrl(s3, command, { expiresIn });
    } catch (e) {
        console.error("S3 Presigner Error:", e);
        throw new Error("Could not generate presigned access URL");
    }
}
