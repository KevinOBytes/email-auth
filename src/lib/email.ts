import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set. Add it to your .env.local");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "onboarding@resend.dev";

/**
 * Send a magic link email via Resend.
 * Called by Better Auth's magicLink plugin `sendMagicLink` callback.
 */
export async function sendMagicLinkEmail(email: string, url: string) {
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Your sign-in link",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1>Sign in to your account</h1>
        <p>Click the button below to sign in. This link expires in 5 minutes.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Sign in
        </a>
        <p style="color:#666;font-size:14px;margin-top:16px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      </div>
    `,
  });
  if (error) throw new Error(`Failed to send magic link: ${error.message}`);
}

/**
 * Send a 6-digit OTP email via Resend.
 * Called by Better Auth's emailOTP plugin `sendVerificationOTP` callback
 * and the 2FA plugin's `sendOTP` callback.
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password" | "2fa" | "change-email",
) {
  const subjectMap: Record<string, string> = {
    "sign-in": "Your sign-in code",
    "email-verification": "Verify your email",
    "forget-password": "Your password reset code",
    "2fa": "Your 2FA verification code",
    "change-email": "Confirm your new email",
  };

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: subjectMap[type] ?? "Your verification code",
    html: `
      <div style="font-family: monospace; max-width: 360px; margin: 0 auto; text-align:center;">
        <h1>${otp}</h1>
        <p style="color:#666;font-size:14px;">
          Enter this code to ${type === "2fa" ? "complete sign-in" : "continue"}.
          It expires in 5 minutes.
        </p>
        <p style="color:#999;font-size:12px;margin-top:16px;">
          If you didn't request this code, ignore this email.
        </p>
      </div>
    `,
  });
  if (error) throw new Error(`Failed to send OTP: ${error.message}`);
}