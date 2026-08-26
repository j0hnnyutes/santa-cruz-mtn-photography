// Resend-backed email for the contact form. Same approach as the tree-site
// project (raw fetch to the Resend HTTP API, no SDK needed) but its own
// independent code — separate API key, separate "from" domain, nothing
// shared between the two projects.
//
// Never throws: a delivery failure shouldn't turn into a 500 for someone
// who just filled out a form. Callers just get a boolean back.

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ContactInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(inquiry: ContactInquiry): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.warn("Resend not configured — contact form submission not emailed");
    return false;
  }

  const payload = {
    from: fromEmail,
    to: [toEmail],
    reply_to: inquiry.email,
    subject: `New inquiry: ${inquiry.subject} — ${inquiry.name}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  :root { color-scheme: light only; }
  @media (prefers-color-scheme: dark) {
    .email-header  { background-color: #14181c !important; }
    .email-body    { background-color: #ffffff !important; }
    .email-footer  { background-color: #f9fafb !important; }
    .email-wrapper { background-color: #f0f2f5 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td class="email-header" style="background-color:#14181c;border-radius:12px 12px 0 0;padding:28px 32px;">
            <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Santa Cruz Mountain Photography</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">New Contact Form Inquiry</h1>
          </td>
        </tr>

        <tr>
          <td class="email-body" style="background-color:#ffffff;padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">From</p>
                  <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">${escHtml(inquiry.name)}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding:0 8px 16px 0;vertical-align:top;">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Email</p>
                          <a href="mailto:${escHtml(inquiry.email)}" style="color:#14181c;font-size:14px;font-weight:600;text-decoration:none;word-break:break-all;">${escHtml(inquiry.email)}</a>
                        </div>
                      </td>
                      <td width="50%" style="padding:0 0 16px 8px;vertical-align:top;">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">What it's about</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${escHtml(inquiry.subject)}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <div style="border-top:1px solid #f3f4f6;padding-top:20px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Message</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;white-space:pre-line;">${escHtml(inquiry.message)}</p>
            </div>

            <div style="border-top:1px solid #f3f4f6;padding-top:24px;margin-top:24px;text-align:center;">
              <a href="mailto:${escHtml(inquiry.email)}" style="display:inline-block;background-color:#14181c;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">Reply to ${escHtml(inquiry.name.split(" ")[0])} →</a>
            </div>
          </td>
        </tr>

        <tr>
          <td class="email-footer" style="background-color:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Sent from the contact form at santacruzmtnphotography.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend API error:", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
    return false;
  }
}
