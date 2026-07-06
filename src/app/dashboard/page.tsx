"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // ── Enable 2FA ──────────────────────────────────────────────────────────
  async function enable2FA() {
    setError(null);
    const { data, error } = await (authClient.twoFactor as any).enable({});
    if (error) {
      setError(error.message ?? "Failed to enable 2FA");
      return;
    }
    // data contains { totpURI, backupCodes }
    setTotpUri(data?.totpURI ?? null);
    setBackupCodes(data?.backupCodes ?? null);
    setTwoFactorEnabled(true);
  }

  // ── Verify TOTP (after scanning QR) ──────────────────────────────────────
  async function verifyTotp(code: string) {
    setError(null);
    const { data, error } = await (authClient.twoFactor as any).verifyTOTP({
      code,
      trustDevice: true,
    });
    if (error) {
      setError(error.message ?? "Invalid code");
      return;
    }
    setTotpUri(null);
    setBackupCodes(null);
  }

  // ── Disable 2FA ──────────────────────────────────────────────────────────
  async function disable2FA() {
    setError(null);
    const { error } = await (authClient.twoFactor as any).disable({});
    if (error) {
      setError(error.message ?? "Failed to disable 2FA");
      return;
    }
    setTwoFactorEnabled(false);
  }

  // ── Sign out ─────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Session info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {session.user.name}</p>
            <p><span className="font-medium">Email:</span> {session.user.email}</p>
            <p>
              <span className="font-medium">Email verified:</span>{" "}
              {session.user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>

        {/* 2FA management */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Two-Factor Authentication</h2>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {!twoFactorEnabled && !totpUri && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm">
                Enable 2FA for an extra layer of security. You&apos;ll need an
                authenticator app (Google Authenticator, Authy, 1Password, etc.).
              </p>
              <button
                onClick={enable2FA}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Enable 2FA
              </button>
            </div>
          )}

          {/* Show QR / TOTP URI after enabling */}
          {totpUri && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">
                Scan this URI with your authenticator app:
              </p>
              <code className="block rounded-lg bg-gray-100 p-3 text-xs break-all">
                {totpUri}
              </code>
              {backupCodes && (
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Save these backup codes (you won&apos;t see them again):
                  </p>
                  <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
                    {backupCodes.map((code, i) => (
                      <li key={i} className="font-mono">{code}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code to confirm"
                  onChange={(e) => {
                    if (e.target.value.length === 6) verifyTotp(e.target.value);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                />
              </div>
            </div>
          )}

          {twoFactorEnabled && !totpUri && (
            <div className="mt-4">
              <p className="text-sm text-green-600 font-medium">
                ✓ Two-factor authentication is enabled
              </p>
              <button
                onClick={disable2FA}
                className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}