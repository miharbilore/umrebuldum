/**
 * Email Templates — Type-safe HTML template functions
 *
 * Each function returns { subject, html, previewText } for use with EmailService.
 * Templates use the shared baseLayout() for consistent branding.
 */

import { baseLayout, ctaButton, infoBox } from "./email-base-layout";

const BASE_URL = process.env.NEXTAUTH_URL || "https://umrebuldum.com";

export interface EmailTemplate {
    subject: string;
    html: string;
}

// --- Auth: Magic Link (Verification) ----------------------------------------

export function verificationLinkTemplate(params: {
    url: string;
    email: string;
}): EmailTemplate {
    const { url, email } = params;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            🔑 Giriş Bağlantınız
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <strong>${email}</strong> hesabınız için giriş talebinde bulunuldu.
            Aşağıdaki butona tıklayarak güvenli bir şekilde giriş yapabilirsiniz.
        </p>
        ${ctaButton("Giriş Yap", url)}
        ${infoBox("Bu bağlantı <strong>24 saat</strong> içinde geçerliliğini yitirecektir. Eğer bu talebi siz oluşturmadıysanız, bu e-postayı güvenle yoksayabilirsiniz.")}
    `;

    return {
        subject: "🔑 Giriş Bağlantısı — UmreBuldum",
        html: baseLayout(content, "UmreBuldum hesabınıza giriş yapmak için bağlantı."),
    };
}

// --- Auth: OTP Verification Code --------------------------------------------

export function verificationCodeTemplate(params: {
    code: string;
    email: string;
    name?: string;
}): EmailTemplate {
    const { code, email, name } = params;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            ✉️ E-posta Doğrulama Kodunuz
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba${name ? ` <strong>${name}</strong>` : ''},
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <strong>${email}</strong> adresiyle UmreBuldum'a kayıt oldunuz.
            Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:24px 0;">
              <div style="
                display:inline-block;
                padding:16px 40px;
                background:linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border-radius:12px;
                font-size:32px;
                font-weight:800;
                letter-spacing:8px;
                color:#ffffff;
                font-family:'Courier New',monospace;
              ">${code}</div>
            </td>
          </tr>
        </table>
        ${infoBox("Bu kod <strong>15 dakika</strong> içinde geçerliliğini yitirecektir. Eğer bu kaydı siz oluşturmadıysanız, bu e-postayı güvenle yoksayabilirsiniz.")}
    `;

    return {
        subject: "✉️ Doğrulama Kodunuz — UmreBuldum",
        html: baseLayout(content, `Doğrulama kodunuz: ${code}`),
    };
}

// --- New Message ------------------------------------------------------------

export function newMessageTemplate(params: {
    recipientName: string;
    senderName: string;
    messagePreview: string;
    conversationUrl?: string;
}): EmailTemplate {
    const { recipientName, senderName, messagePreview, conversationUrl } = params;
    const url = conversationUrl || `${BASE_URL}/dashboard/messages`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            💬 Yeni Mesajınız Var
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <strong>${senderName}</strong> size yeni bir mesaj gönderdi:
        </p>
        ${infoBox(`"${messagePreview.slice(0, 200)}${messagePreview.length > 200 ? "..." : ""}"`)}
        ${ctaButton("Mesajı Görüntüle", url)}
        <p style="margin:16px 0 0 0; color:#94a3b8; font-size:12px; text-align:center;">
            Bu bildirimleri almak istemiyor musunuz? Ayarlarınızı panelden değiştirebilirsiniz.
        </p>
    `;

    return {
        subject: `💬 ${senderName} size mesaj gönderdi — UmreBuldum`,
        html: baseLayout(content, `${senderName} size yeni bir mesaj gönderdi.`),
    };
}

// --- New Offer --------------------------------------------------------------

export function newOfferTemplate(params: {
    recipientName: string;
    guideName: string;
    offerAmount: string;
    listingTitle: string;
    offerUrl?: string;
}): EmailTemplate {
    const { recipientName, guideName, offerAmount, listingTitle, offerUrl } = params;
    const url = offerUrl || `${BASE_URL}/dashboard/offers`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            💰 Yeni Teklif Aldınız
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <strong>${guideName}</strong> tarafından <em>"${listingTitle}"</em> ilanınız için yeni bir teklif geldi.
        </p>
        ${infoBox(`
            <strong>Teklif Tutarı:</strong> ${offerAmount}<br/>
            <strong>Rehber:</strong> ${guideName}
        `)}
        ${ctaButton("Teklifi İncele", url)}
    `;

    return {
        subject: `💰 ${guideName} tarafından yeni teklif — UmreBuldum`,
        html: baseLayout(content, `${guideName} size ${offerAmount} tutarında bir teklif gönderdi.`),
    };
}

// --- Offer Accepted ---------------------------------------------------------

export function offerAcceptedTemplate(params: {
    guideName: string;
    userName: string;
    listingTitle: string;
    offerAmount: string;
    dashboardUrl?: string;
}): EmailTemplate {
    const { guideName, userName, listingTitle, offerAmount, dashboardUrl } = params;
    const url = dashboardUrl || `${BASE_URL}/dashboard`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            ✅ Teklifiniz Kabul Edildi!
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${guideName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            Harika haber! <strong>${userName}</strong>, <em>"${listingTitle}"</em> için gönderdiğiniz
            <strong>${offerAmount}</strong> tutarındaki teklifi kabul etti.
        </p>
        ${ctaButton("Panele Git", url)}
    `;

    return {
        subject: `✅ Teklifiniz kabul edildi — ${listingTitle}`,
        html: baseLayout(content, `${userName} teklifinizi kabul etti!`),
    };
}

// --- Password Reset ---------------------------------------------------------

export function passwordResetTemplate(params: {
    resetUrl: string;
    email: string;
}): EmailTemplate {
    const { resetUrl, email } = params;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            🔑 Şifre Sıfırlama
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <strong>${email}</strong> hesabınız için şifre sıfırlama talebinde bulunuldu.
            Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
        </p>
        ${ctaButton("Şifremi Sıfırla", resetUrl)}
        ${infoBox("Bu bağlantı <strong>1 saat</strong> içinde geçerliliğini yitirecektir. Eğer bu talebi siz oluşturmadıysanız, bu e-postayı güvenle yoksayabilirsiniz.")}
    `;

    return {
        subject: "🔑 Şifre Sıfırlama — UmreBuldum",
        html: baseLayout(content, "Şifrenizi sıfırlamak için bağlantı."),
    };
}

// --- Welcome ----------------------------------------------------------------

export function welcomeTemplate(params: {
    userName: string;
}): EmailTemplate {
    const { userName } = params;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            🕋 UmreBuldum'a Hoş Geldiniz!
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${userName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            UmreBuldum ailesine katıldığınız için çok mutluyuz! Platformumuzda güvenilir umre rehberlerini keşfedebilir,
            turları karşılaştırabilir ve size en uygun seçeneği bulabilirsiniz.
        </p>
        ${ctaButton("Keşfetmeye Başla", BASE_URL)}
        <p style="margin:20px 0 0 0; color:#64748b; font-size:14px;">
            Herhangi bir sorunuz varsa bize ulaşmaktan çekinmeyin. İyi yolculuklar! 🤲
        </p>
    `;

    return {
        subject: "🕋 UmreBuldum'a Hoş Geldiniz!",
        html: baseLayout(content, `Merhaba ${userName}, UmreBuldum'a hoş geldiniz!`),
    };
}

// --- Payment Success --------------------------------------------------------

export function paymentSuccessTemplate(params: {
    userName: string;
    packageName: string;
    amount: string;
    credits: number;
}): EmailTemplate {
    const { userName, packageName, amount, credits } = params;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            💳 Ödeme Onayı
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${userName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            Ödemeniz başarıyla tamamlandı ve tokenleriniz hesabınıza tanımlandı.
        </p>
        ${infoBox(`
            <strong>Paket:</strong> ${packageName}<br/>
            <strong>Tutar:</strong> ${amount}<br/>
            <strong>Token:</strong> ${credits} adet
        `)}
        ${ctaButton("Panele Git", `${BASE_URL}/dashboard/billing`)}
    `;

    return {
        subject: `💳 Ödeme onayı: ${packageName} — UmreBuldum`,
        html: baseLayout(content, `Ödemeniz onaylandı. ${credits} token hesabınıza tanımlandı.`),
    };
}

// --- Listing Expired --------------------------------------------------------

export function listingExpiredTemplate(params: {
    guideName: string;
    listingTitle: string;
    renewUrl?: string;
}): EmailTemplate {
    const { guideName, listingTitle, renewUrl } = params;
    const url = renewUrl || `${BASE_URL}/dashboard/listings`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            ⏳ İlanınız Sona Erdi
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${guideName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <em>"${listingTitle}"</em> başlıklı ilanınızın süresi doldu. İlanınızı yenileyerek
            yeniden görünür hale getirebilirsiniz.
        </p>
        ${ctaButton("İlanı Yenile", url)}
    `;

    return {
        subject: `⏳ İlanınız sona erdi: ${listingTitle}`,
        html: baseLayout(content, `"${listingTitle}" ilanınızın süresi doldu.`),
    };
}

// --- Listing Expiring Soon (Warning) ----------------------------------------

export function listingExpiringWarningTemplate(params: {
    guideName: string;
    listingTitle: string;
    daysLeft: number;
    renewUrl?: string;
}): EmailTemplate {
    const { guideName, listingTitle, daysLeft, renewUrl } = params;
    const url = renewUrl || `${BASE_URL}/dashboard/listings`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            ⚠️ İlan Süreniz Dolmak Üzere
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${guideName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            <em>"${listingTitle}"</em> başlıklı ilanınızın yayın süresi <strong>${daysLeft} gün</strong> sonra dolacaktır.
            Yayında kalmaya devam etmesi için süreyi uzatmayı unutmayın.
        </p>
        ${ctaButton("İlanı Yenile", url)}
    `;

    return {
        subject: `⚠️ İlan süreniz dolmak üzere: ${listingTitle}`,
        html: baseLayout(content, `"${listingTitle}" ilanınızın süresi ${daysLeft} gün sonra dolacak.`),
    };
}

// --- Package Expiring Soon --------------------------------------------------

export function packageExpiringTemplate(params: {
    userName: string;
    packageName: string;
    daysLeft: number;
    renewUrl?: string;
}): EmailTemplate {
    const { userName, packageName, daysLeft, renewUrl } = params;
    const url = renewUrl || `${BASE_URL}/dashboard/billing`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            ⚠️ Paket Süreniz Doluyor
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${userName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            Kullanmakta olduğunuz <strong>${packageName}</strong> paketinizin süresi <strong>${daysLeft} gün</strong> sonra dolacaktır.
            İlanlarınızın ve teklif haklarınızın kesintiye uğramaması için paketinizi yenilemeyi unutmayın.
        </p>
        ${ctaButton("Paketi Yenile", url)}
    `;

    return {
        subject: `⚠️ Paket süreniz doluyor (${packageName}) — UmreBuldum`,
        html: baseLayout(content, `${packageName} paketinizin süresi ${daysLeft} gün sonra dolacak.`),
    };
}

// --- New Lead (Request) -----------------------------------------------------

export function newLeadTemplate(params: {
    guideName: string;
    departureCity: string;
    peopleCount: number;
    requestUrl?: string;
}): EmailTemplate {
    const { guideName, departureCity, peopleCount, requestUrl } = params;
    const url = requestUrl || `${BASE_URL}/dashboard/requests`;

    const content = `
        <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1e293b;">
            🎯 Yeni Bir Umre Talebi!
        </h1>
        <p style="margin:0 0 12px 0;">
            Merhaba <strong>${guideName}</strong>,
        </p>
        <p style="margin:0 0 20px 0; color:#475569;">
            Kriterlerinize uygun yeni bir Umre talebi oluşturuldu. Müşteriye ilk teklifi veren siz olun!
        </p>
        ${infoBox(`
            <strong>Kalkış Yeri:</strong> ${departureCity}<br/>
            <strong>Kişi Sayısı:</strong> ${peopleCount} Kişi
        `)}
        ${ctaButton("Talebi İncele", url)}
    `;

    return {
        subject: `🎯 Yeni Umre Talebi: ${departureCity} çıkışlı, ${peopleCount} kişilik`,
        html: baseLayout(content, `Yeni bir umre talebi oluşturuldu: ${departureCity} çıkışlı, ${peopleCount} kişilik.`),
    };
}