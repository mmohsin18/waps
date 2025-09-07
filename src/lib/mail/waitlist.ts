import { Resend } from 'resend'

// ---------- Types ----------
export type WaitlistPayload = {
  to: string
  name?: string | null
  manageUrl?: string // e.g. a page to update preferences or view status
  apkUrl?: string // optional: link to download the APK when ready
}

const BRAND = {
  product: process.env.BRAND_NAME ?? 'Waps',
  tagline: process.env.BRAND_TAGLINE ?? 'Your bookmarking buddy',
  // used for <meta name="theme-color"> style in web; in email just for continuity
  theme: { start: '#FF6B57', end: '#FFB057', bg: '#0B0B10' },
  from: process.env.CONTACT_FROM ?? 'Waps <hello@yourdomain.com>'
}

// ---------- Public API: RESEND ----------
export async function sendWaitlistConfirmationResend(
  payload: WaitlistPayload
): Promise<void> {
  const { to } = payload
  ensureEmail(to)

  //const key = process.env.RESEND_API_KEY
  //if (!key) throw new Error('RESEND_API_KEY is not set')
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: BRAND.from,
    to,
    subject: subjectLine(payload),
    html: renderWaitlistHtml(payload),
    text: renderWaitlistText(payload)
  })
}

// ---------- Template (HTML) ----------
export function renderWaitlistHtml({
  name,
  manageUrl,
  apkUrl
}: WaitlistPayload) {
  const hello = name ? `Hi ${escapeHtml(name)},` : 'Hi there,'
  const cta = manageUrl
    ? `<a href="${escapeAttr(manageUrl)}" class="btn" target="_blank" rel="noopener">Manage your spot</a>`
    : ''
  const apk = apkUrl
    ? `<a href="${escapeAttr(apkUrl)}" class="btn ghost" target="_blank" rel="noopener">Get the APK</a>`
    : ''
  const year = new Date().getFullYear()

  // We keep styles inline & simple for better email-client support.
  return `
  <div style="background:${BRAND.theme.bg};padding:24px 0;color:#fff;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="620" style="width:620px;max-width:92%;">
            <tr>
              <td style="border:1px solid rgba(255,255,255,0.15);border-radius:20px;background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);padding:0;overflow:hidden;">
                <!-- Gradient header -->
                <div style="height:120px;background:radial-gradient(circle at 30% 20%, rgba(255,107,87,0.45), transparent 55%), radial-gradient(circle at 90% 10%, rgba(255,176,87,0.35), transparent 45%), linear-gradient(135deg, ${BRAND.theme.start}, ${BRAND.theme.end});"></div>

                <!-- Card body -->
                <div style="padding:20px 20px 24px;background:rgba(10,10,14,0.96);">
                  <!-- Mini logo -->
                  <div style="display:inline-grid;place-items:center;width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, ${BRAND.theme.start}, ${BRAND.theme.end});font-weight:900;">W</div>
                  <div style="margin-top:10px;font-size:18px;font-weight:700;line-height:1.2;">${escapeHtml(
                    BRAND.product
                  )}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.7)">${escapeHtml(
                    BRAND.tagline
                  )}</div>

                  <div style="margin-top:16px;font-size:16px;font-weight:700;">You're on the waitlist 🎉</div>
                  <p style="margin:8px 0 0 0;line-height:1.6;color:rgba(255,255,255,0.9);">
                    ${hello}
                    Thanks for joining the ${escapeHtml(
                      BRAND.product
                    )} waitlist. We’re building a Play-Store-style directory for the web:
                    beautifully categorized sites, shareable boards, offline sync, and AI-powered descriptions when you paste a URL.
                  </p>

                  <div style="margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.06);">
                    <div style="font-weight:700;margin-bottom:6px;">What you’ll get:</div>
                    <ul style="margin:0 0 0 18px;padding:0;line-height:1.6;color:rgba(255,255,255,0.9);">
                      <li>Early access to <b>Explore</b>: public boards with no duplicate sites.</li>
                      <li><b>Waps</b> (your library): filter by board, categories—mobile-first, glassy UI.</li>
                      <li><b>AI scan</b>: paste a link → title, description, category & favicon auto-filled.</li>
                    </ul>
                  </div>

                  <div style="margin-top:16px;">
                    ${cta}
                    ${apk}
                  </div>

                  <p style="margin:16px 0 0 0;font-size:12px;color:rgba(255,255,255,0.7)">
                    You’ll hear from us soon with your invite. Until then, you can reply to this email if you have questions.
                  </p>

                  <div style="margin-top:18px;border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;font-size:11px;color:rgba(255,255,255,0.55);">
                    © ${year} ${escapeHtml(BRAND.product)} — ${escapeHtml(BRAND.tagline)}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- button styles -->
          <style>
            .btn {
              display:inline-block;
              padding:10px 14px;
              margin-right:8px;
              border-radius:12px;
              background: linear-gradient(135deg, ${BRAND.theme.start}, ${BRAND.theme.end});
              color:#fff!important;
              text-decoration:none;
              font-weight:600;
              font-size:14px;
            }
            .btn.ghost {
              background:rgba(255,255,255,0.08);
              border:1px solid rgba(255,255,255,0.2);
            }
          </style>
        </td>
      </tr>
    </table>
  </div>
  `
}

// ---------- Template (Plain text fallback) ----------
export function renderWaitlistText({
  name,
  manageUrl,
  apkUrl
}: WaitlistPayload) {
  const hello = name ? `Hi ${name},` : 'Hi there,'
  return [
    `${BRAND.product} — Waitlist confirmation`,
    '',
    hello,
    `Thanks for joining the ${BRAND.product} waitlist.`,
    '',
    "What you'll get:",
    '- Early access to Explore (public boards; no duplicate sites).',
    '- Waps (your library) with categories/boards and mobile-first UI.',
    '- AI scan: paste a link → title, description, category & favicon.',
    '',
    manageUrl ? `Manage your spot: ${manageUrl}` : '',
    apkUrl ? `Get the APK: ${apkUrl}` : '',
    '',
    'We’ll email you soon with your invite. Reply to this email with any questions.'
  ]
    .filter(Boolean)
    .join('\n')
}

// ---------- Helpers ----------
function subjectLine(_: WaitlistPayload) {
  return "You're on the Waps waitlist 🎉"
}
function ensureEmail(to: string) {
  if (!/^\S+@\S+\.\S+$/.test(to)) throw new Error('Invalid recipient email.')
}
function mustGet(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set`)
  return v
}
function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
function escapeAttr(s: string) {
  return escapeHtml(s).replaceAll('"', '&quot;')
}
