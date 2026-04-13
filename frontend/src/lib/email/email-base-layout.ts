/**
 * Base HTML Layout for all transactional emails.
 *
 * Design principles:
 * - Table-based layout for maximum email client compatibility
 * - Inline styles only (Gmail strips <style> tags)
 * - Dark header with gradient, white content card, gray footer
 * - Preview text (invisible in body, visible in inbox list)
 * - 600px max width (email standard)
 */

const BRAND_COLOR = "#1e293b";
const ACCENT_COLOR = "#2563eb";
const LOGO_URL = "https://umrebuldum.com/logo-white.png";
const YEAR = new Date().getFullYear();

export function baseLayout(content: string, previewText: string): string {
    return `<!DOCTYPE html>
<html lang="tr" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>UmreBuldum</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .content { width: 600px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">

  <!-- Preview text -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    ${previewText}
    ${"&zwnj;&nbsp;".repeat(30)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        
        <!-- Main Card -->
        <table role="presentation" class="content" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_COLOR} 0%, #334155 100%); padding:28px 32px; text-align:center;">
              <img src="${LOGO_URL}" width="160" height="auto" alt="UmreBuldum" style="display:inline-block; border:0; outline:none;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 32px 24px 32px; color:#1e293b; font-size:15px; line-height:1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:24px 32px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px 0; color:#94a3b8; font-size:12px; line-height:1.5;">
                Â© ${YEAR} UmreBuldum. Tüm hakları saklıdır.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.5;">
                Bu e-posta <a href="https://umrebuldum.com" style="color:#64748b; text-decoration:none;">umrebuldum.com</a> üzerindeki hesabınızla ilgili gönderilmiştir.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Reusable CTA button for email templates.
 */
export function ctaButton(text: string, href: string): string {
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px 0 8px 0;">
          <a href="${href}" target="_blank" style="
            display:inline-block;
            padding:14px 36px;
            background:linear-gradient(135deg, ${ACCENT_COLOR} 0%, #1d4ed8 100%);
            color:#ffffff;
            text-decoration:none;
            font-size:15px;
            font-weight:600;
            border-radius:10px;
            letter-spacing:0.3px;
            mso-padding-alt:14px 36px;
          ">
            <!--[if mso]>
            <i style="mso-text-raise:21pt; letter-spacing:36px;">&nbsp;</i>
            <![endif]-->
            ${text}
            <!--[if mso]>
            <i style="letter-spacing:36px;">&nbsp;</i>
            <![endif]-->
          </a>
        </td>
      </tr>
    </table>`;
}

/**
 * Info box for secondary content.
 */
export function infoBox(content: string): string {
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px; background-color:#f0f9ff; border-radius:10px; border-left:4px solid ${ACCENT_COLOR}; font-size:14px; color:#334155; line-height:1.6;">
          ${content}
        </td>
      </tr>
    </table>`;
}
