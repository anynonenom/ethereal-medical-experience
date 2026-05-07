const RESEND_KEY = import.meta.env.VITE_RESEND_API_KEY as string | undefined;
const FROM_ADDRESS = (import.meta.env.VITE_EMAIL_FROM as string | undefined)
  ?? "Medical Bay <onboarding@resend.dev>";

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

function buildHtml(subject: string, body: string): string {
  const bodyHtml = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F5FAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5FAFA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0D1A18;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <!-- Logo mark (teal square + M) -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#2BBAA5;width:36px;height:36px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-1px;line-height:36px;display:block;">M</span>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <div style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;line-height:1;">MEDICAL BAY</div>
                          <div style="color:#8AADA8;font-size:9px;font-weight:600;letter-spacing:0.35em;text-transform:uppercase;margin-top:4px;">Agadir · Maroc</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TEAL ACCENT BAR -->
          <tr>
            <td style="background:#2BBAA5;height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              <!-- Subject line -->
              <p style="margin:0 0 28px;font-size:11px;font-weight:700;letter-spacing:0.32em;text-transform:uppercase;color:#8AADA8;">${subject}</p>
              <!-- Message content -->
              <div style="font-size:15px;line-height:1.8;color:#2A3A38;font-weight:300;">${bodyHtml}</div>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <div style="border-top:1px solid #C4D8D5;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#2BBAA5;">Medical Bay</p>
                    <p style="margin:0;font-size:11px;color:#8AADA8;font-weight:300;line-height:1.6;">
                      Centre Médical · Agadir, Maroc<br>
                      contact@medicalbay.ma &nbsp;·&nbsp; +212 5 28 XX XX XX
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <div style="display:inline-block;background:#E8F5F3;padding:6px 14px;">
                      <span style="font-size:9px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#2BBAA5;">TOURISME MÉDICAL</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOTTOM BAR -->
          <tr>
            <td style="background:#0D1A18;padding:14px 40px;">
              <p style="margin:0;font-size:9px;color:#8AADA8;font-weight:400;letter-spacing:0.15em;">
                Cet e-mail a été envoyé depuis le CRM Medical Bay.
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

export async function sendEmail({ to, subject, body, replyTo }: EmailPayload): Promise<void> {
  if (!RESEND_KEY) throw new Error("VITE_RESEND_API_KEY is not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject,
      text: body,
      html: buildHtml(subject, body),
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Échec de l'envoi (${res.status})`);
  }
}
