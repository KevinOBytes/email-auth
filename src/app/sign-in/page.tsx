"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Tab = "magic-link" | "otp";

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("magic-link");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Magic Link ──────────────────────────────────────────────────────────
  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    const { data, error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/dashboard",
      newUserCallbackURL: "/dashboard",
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Failed to send magic link");
    } else {
      setStatus("Check your email for a sign-in link. It expires in 5 minutes.");
    }
  }

  // ── Email OTP ────────────────────────────────────────────────────────────
  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    const { data, error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Failed to send OTP");
    } else {
      setStatus("Enter the 6-digit code sent to your email.");
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await authClient.signIn.emailOtp({
      email,
      otp,
      name: name || undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Invalid or expired code");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-gray-600">
            Passwordless email authentication
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => { setTab("magic-link"); setError(null); setStatus(null); }}
            className={`flex-1 py-2 text-sm font-medium transition ${
              tab === "magic-link"
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => { setTab("otp"); setError(null); setStatus(null); }}
            className={`flex-1 py-2 text-sm font-medium transition ${
              tab === "otp"
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Email Code
          </button>
        </div>

        {/* Magic Link form */}
        {tab === "magic-link" && (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        {/* Email OTP form */}
        {tab === "otp" && (
          <div className="space-y-4">
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
                />
                {otp === "" && (
                  <input
                    type="text"
                    placeholder="Name (optional, for new users)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
                  />
                )}
              </div>
              {!status && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>
              )}
            </form>

            {status && (
              <form onSubmit={verifyOtp} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            )}
          </div>
        )}

        {status && (
          <p className="text-center text-sm text-green-600">{status}</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}