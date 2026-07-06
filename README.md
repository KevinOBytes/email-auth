# email-auth

Passwordless email authentication with optional two-factor authentication (2FA).

Built with [Better Auth](https://better-auth.com), [Drizzle ORM](https://orm.drizzle.team), and [Resend](https://resend.com) on Next.js 16.

## Features

- **Passwordless sign-in** — no passwords, ever
  - Magic Link — click a link in your email
  - Email OTP — enter a 6-digit code from your email
- **Two-Factor Authentication (2FA)** — optional, per-user
  - TOTP — scan a QR code with any authenticator app (Google Authenticator, Authy, 1Password)
  - Email OTP fallback — receive a code if you lose your authenticator
  - Backup codes — one-time recovery codes
- **Postgres via Drizzle ORM** — Neon, Supabase, or any Postgres
- **Resend for email delivery** — magic links and OTP codes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | Better Auth |
| ORM | Drizzle ORM + node-postgres |
| Database | PostgreSQL (Neon recommended) |
| Email | Resend |
| Language | TypeScript |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the following:

- `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`
- `BETTER_AUTH_URL` — `http://localhost:3000` for local dev
- `DATABASE_URL` — a Postgres connection string (e.g. from [Neon](https://neon.tech))
- `RESEND_API_KEY` — get one at [resend.com/api-keys](https://resend.com/api-keys)
- `EMAIL_FROM` — sender address (use `onboarding@resend.dev` for testing, or your verified domain)

### 3. Create the database schema

Generate the Drizzle migration and apply it:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Alternatively, use Better Auth's CLI to create the tables directly:

```bash
npx auth@latest generate   # generates Drizzle schema
npx auth@latest migrate    # applies to database (Kysely adapter only)
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the sign-in page.

## How It Works

### Authentication Flow

```
User enters email
       │
       ├── Magic Link tab ──► Better Auth sends link via Resend
       │                        └── User clicks link ──► Authenticated (session cookie)
       │
       └── Email Code tab ──► Better Auth sends 6-digit OTP via Resend
                               └── User enters code ──► Authenticated (session cookie)
```

### 2FA Flow (optional, user-enabled)

```
User enables 2FA on dashboard
       │
       ├── Better Auth generates TOTP secret + backup codes
       ├── User scans QR URI into authenticator app
       ├── User enters 6-digit TOTP to confirm
       └── 2FA is now active
           │
           On next sign-in (credential endpoints):
           └── Redirected to /two-factor
               ├── Enter TOTP from authenticator app
               └── OR click "send code to email" for OTP fallback
```

> **Note:** 2FA is configured with `allowPasswordless: true` so passwordless
> users can enable and manage 2FA without a password. By default, Better Auth
> only gates credential-based sign-in endpoints (`/sign-in/email`) with 2FA.
> Magic link and email OTP sign-in are not gated by default — to enforce 2FA
> on those flows, add custom hooks on the server.

### Key Files

```
src/
├── db/
│   ├── schema.ts          # Drizzle schema (user, session, account, verification, twoFactor)
│   └── index.ts           # Drizzle client
├── lib/
│   ├── auth.ts            # Better Auth server config (plugins: magicLink, emailOTP, twoFactor)
│   ├── auth-client.ts     # Better Auth React client
│   └── email.ts           # Resend email service (magic link + OTP)
├── app/
│   ├── api/auth/[...all]/  # Better Auth API route handler
│   ├── sign-in/            # Magic link + email OTP sign-in page
│   ├── dashboard/          # Protected page + 2FA management
│   ├── two-factor/         # 2FA verification page
│   └── page.tsx           # Redirects to /sign-in
├── drizzle.config.ts      # Drizzle Kit config
└── .env.example           # Environment variable template
```

## Deployment

### Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (BETTER_AUTH_SECRET, DATABASE_URL, RESEND_API_KEY, EMAIL_FROM)
4. Set `BETTER_AUTH_URL` to your Vercel domain
5. Deploy

### Database

Provision a Postgres database from [Neon](https://neon.tech) (free tier available). Run migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Email (Resend)

1. Create a [Resend](https://resend.com) account (free: 3,000 emails/month)
2. Add and verify your sending domain at [resend.com/domains](https://resend.com/domains)
3. Set `EMAIL_FROM` to your verified domain address
4. For local testing, use `onboarding@resend.dev`

## License

MIT