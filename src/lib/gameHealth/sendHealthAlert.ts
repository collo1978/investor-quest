import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";
import { opsTierPresentation } from "@/lib/operations/healthTier";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendGameHealthAlertEmail(params: {
  to: string;
  score: number;
  statusLabel: string;
  issues: GameHealthIssueRecord[];
  fixBaseUrl: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.GAME_HEALTH_EMAIL_FROM?.trim() || "Investor Quest <onboarding@resend.dev>";

  const topIssue = params.issues[0];
  const subject = topIssue
    ? `Investor Quest Alert — ${topIssue.title}`
    : `Investor Quest Health — ${params.score}%`;

  const fixUrl = topIssue
    ? `${params.fixBaseUrl}/admin/mobile-fix/${topIssue.id}`
    : `${params.fixBaseUrl}/admin/game-health`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#0a0a12;color:#f5f5f5;padding:20px;">
  <div style="max-width:420px;margin:0 auto;">
    <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;">Investor Quest Alert</p>
    <h1 style="font-size:22px;margin:12px 0;">Health: ${params.score}%</h1>
    <p style="color:#cbd5e1;font-size:18px;font-weight:700;">${escapeHtml(opsTierPresentation(params.score).label)}</p>
    <p style="color:#94a3b8;font-size:14px;margin-top:8px;">${escapeHtml(opsTierPresentation(params.score).explanation)}</p>
    ${
      topIssue
        ? `
    <div style="margin-top:20px;padding:16px;border-radius:12px;background:#14141f;border:1px solid rgba(255,255,255,0.1);">
      <p style="font-size:11px;text-transform:uppercase;color:#fbbf24;">Problem</p>
      <p style="font-size:16px;font-weight:600;">${escapeHtml(topIssue.problemPlain)}</p>
      <p style="font-size:11px;text-transform:uppercase;color:#94a3b8;margin-top:14px;">What users may see</p>
      <p>${escapeHtml(topIssue.whatUsersSee)}</p>
      <p style="font-size:11px;text-transform:uppercase;color:#94a3b8;margin-top:14px;">Suggested fix</p>
      <p>${escapeHtml(topIssue.suggestedFix)}</p>
    </div>`
        : ""
    }
    <p style="margin-top:24px;">
      <a href="${fixUrl}" style="display:inline-block;padding:14px 22px;background:#a855f7;color:#000;font-weight:700;text-decoration:none;border-radius:10px;">Open Fix Panel</a>
    </p>
    <p style="margin-top:16px;font-size:12px;color:#64748b;">
      <a href="${params.fixBaseUrl}/admin/game-health" style="color:#94a3b8;">View full health dashboard</a>
    </p>
  </div>
</body>
</html>`;

  if (!apiKey) {
    console.info("[game-health:alert-email-skipped]", {
      to: params.to,
      subject,
      fixUrl,
      hint: "Set RESEND_API_KEY to send real emails."
    });
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject,
        html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("[game-health:alert-email-failed]", err);
      return false;
    }

    console.info("[game-health:alert-email-sent]", { to: params.to, subject });
    return true;
  } catch (err) {
    console.warn("[game-health:alert-email-error]", err);
    return false;
  }
}
