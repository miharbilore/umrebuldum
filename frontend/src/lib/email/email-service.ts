import { Resend } from "resend";
import type { EmailTemplate } from "./email-templates";

/**
 * EmailService â€” Unified transactional email sender via Resend API.
 *
 * ALL email in the system (Auth verification, notifications, messages)
 * MUST flow through this service. No other transport (SMTP, Nodemailer) exists.
 *
 * Features:
 * - Single Resend API key authentication
 * - Graceful fallback when API key is not set (console.log only)
 * - Type-safe email categories for audit trail
 * - Batch send support for bulk notifications
 */

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type EmailType = "verification" | "notification" | "message";

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    type: EmailType;
}

export interface SendResult {
    success: boolean;
    id?: string;
    error?: string;
}

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FROM_ADDRESS = process.env.EMAIL_FROM || "UmreBuldum <noreply@umrebuldum.com>";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
    if (resendClient) return resendClient;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("[EmailService] RESEND_API_KEY not set â€” emails will be logged to console only.");
        return null;
    }

    resendClient = new Resend(apiKey);
    return resendClient;
}

// â”€â”€â”€ Core: sendEmail (Standard Interface) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Standard email sending method. ALL callers (Auth.js, notifications, etc.)
 * MUST use this single entry point.
 */
async function sendEmail(options: SendEmailOptions): Promise<SendResult> {
    const { to, subject, html, type } = options;
    const client = getClient();

    // Development / no API key: console.log ONLY (no file writes)
    if (!client) {
        console.log(`â”€â”€ EMAIL [${type.toUpperCase()}] (DEV) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`HTML: ${html.length} chars`);
        console.log(`â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`);
        return { success: true, id: `dev_${Date.now()}` };
    }

    try {
        const { data, error } = await client.emails.send({
            from: FROM_ADDRESS,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error(`[EmailService] [${type}] Failed â†’ ${to}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[EmailService] [${type}] Sent â†’ ${to}: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (err: any) {
        console.error(`[EmailService] [${type}] Exception â†’ ${to}:`, err.message);
        return { success: false, error: err.message };
    }
}

// â”€â”€â”€ Legacy-compatible wrappers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Send using an EmailTemplate object (backward-compatible with existing callers).
 */
async function send(
    to: string,
    template: EmailTemplate,
    replyTo?: string
): Promise<SendResult> {
    return sendEmail({ to, subject: template.subject, html: template.html, type: "notification" });
}

/**
 * Send emails to multiple recipients (same template).
 * Resend supports batch sending for efficiency.
 */
async function sendBatch(
    recipients: Array<{ email: string; template: EmailTemplate }>
): Promise<SendResult[]> {
    const client = getClient();

    if (!client) {
        return recipients.map((r) => {
            console.log(`[EmailService] DEV batch â†’ ${r.email}: ${r.template.subject}`);
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

// â”€â”€â”€ Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const emailService = {
    sendEmail,
    send,
    sendBatch,
    sendAsync,
};
