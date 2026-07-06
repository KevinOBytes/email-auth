import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";
import { db, schema } from "@/db";
import { sendMagicLinkEmail, sendOtpEmail } from "@/lib/email";

export const auth = betterAuth({
  appName: "Email Auth",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      twoFactor: schema.twoFactor,
    },
    usePlural: false,
  }),

  // ── Passwordless: email/password explicitly disabled ──────────────────
  emailAndPassword: {
    enabled: false,
  },

  plugins: [
    // Magic link — click a link in email to sign in
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),

    // Email OTP — enter a 6-digit code from email to sign in
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOtpEmail(email, otp, type);
      },
    }),

    // 2FA — TOTP (authenticator app) + OTP (email) backup
    // allowPasswordless: true is REQUIRED for passwordless users to
    // enable/manage 2FA. Without it, the plugin demands a password.
    twoFactor({
      allowPasswordless: true,
      sendOTP: async ({ email, otp }: { email: string; otp: string }) => {
        await sendOtpEmail(email, otp, "2fa");
      },
    }),
  ],
});

export type Auth = typeof auth;