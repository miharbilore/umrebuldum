import { Resend } from "resend";
import type { EmailTemplate } from "./email-templates";

/**
 * EmailService — Unified transactional email sender via Resend API.
 *
 * Features:
 * - Single API key authentication
 * - Graceful fallback when API key is not set (logs to console)
 * - Rate limiting awareness (Resend free tier: 100/day)
 * - Batch send support for bulk notifications
 *
 * Usage:
 *   import { emailService } from "@/lib/email/email-service";
 *   await emailService.send("user@example.com", passwordResetTemplate({ ... }));
 */

const FROM_ADDRESS = process.env.EMAIL_FROM || "UmreBuldum <noreply@umrebuldum.com>";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
    if (resendClient) return resendClient;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("[EmailService] RESEND_API_KEY not set — emails will be logged to console only.");
        return null;
    }

    resendClient = new Resend(apiKey);
    return resendClient;
}

interface SendResult {
    success: boolean;
    id?: string;
    error?: string;
}

/**
 * Send a single transactional email.
 *
 * @param to Recipient email address
 * @param template Email template (subject + html)
 * @param replyTo Optional reply-to address
 */
async function send(
    to: string,
    template: EmailTemplate,
    replyTo?: string
): Promise<SendResult> {
    const client = getClient();

    // Development / no API key: log to console
    if (!client) {
        console.log("──────────── EMAIL (DEV MODE) ────────────");
        console.log(`To: ${to}`);
        console.log(`Subject: ${template.subject}`);
        console.log(`HTML length: ${template.html.length} chars`);
        console.log("──────────────────────────────────────────");
        return { success: true, id: `dev_${Date.now()}` };
    }

    try {
        const { data, error } = await client.emails.send({
            from: FROM_ADDRESS,
            to: [to],
            subject: template.subject,
            html: template.html,
            ...(replyTo ? { reply_to: replyTo } : {}),
        });

        if (error) {
            console.error(`[EmailService] Failed to send to ${to}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[EmailService] Sent to ${to}: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (err: any) {
        console.error(`[EmailService] Exception sending to ${to}:`, err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Send emails to multiple recipients (same template).
 * Resend supports batch sending for efficiency.
 *
 * @param recipients Array of { email, template } pairs
 */
async function sendBatch(
    recipients: Array<{ email: string; template: EmailTemplate }>
): Promise<SendResult[]> {
    const client = getClient();

    if (!client) {
        return recipients.map((r) => {
            console.log(`[EmailService] DEV batch → ${r.email}: ${r.template.subject}`);
            return { success: true, id: `dev_batch_${Date.now()}` };
        });
    }

    const batchPayload = recipients.map((r) => ({
        from: FROM_ADDRESS,
        to: [r.email],
        subject: r.template.subject,
        html: r.template.html,
    }));

    try {
        const { data, error } = await client.batch.send(batchPayload);

        if (error) {
            console.error("[EmailService] Batch send error:", error);
            return recipients.map(() => ({ success: false, error: (error as any).message }));
        }

        console.log(`[EmailService] Batch sent: ${(data as any)?.data?.length || recipients.length} emails`);
        return ((data as any)?.data || []).map((item: any) => ({
            success: true,
            id: item.id,
        }));
    } catch (err: any) {
        console.error("[EmailService] Batch exception:", err.message);
        return recipients.map(() => ({ success: false, error: err.message }));
    }
}

/**
 * Fire-and-forget email send (non-blocking).
 * Use for notifications that shouldn't delay the API response.
 */
function sendAsync(to: string, template: EmailTemplate, replyTo?: string): void {
    send(to, template, replyTo).catch((err) => {
        console.error(`[EmailService] Async send failed to ${to}:`, err);
    });
}

export const emailService = {
    send,
    sendBatch,
    sendAsync,
};
