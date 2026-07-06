"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verifyTotp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await (authClient.twoFactor as any).verifyTOTP({
      code,
      trustDevice: true,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Invalid code");
    } else {
      router.push("/dashboard");
    }
  }

  async function sendOtp() {
    setError(null);
    const { error } = await (authClient.twoFactor as any).sendOTP();
    if (error) {
      setError(error.message ?? "Failed to send OTP");
    } else {
      setError("A one-time code has been sent to your email.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Two-Factor Verification</h1>
          <p className="mt-2 text-gray-600">
            Enter the code from your authenticator app
          </p>
        </div>

        <form onSubmit={verifyTotp} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-500">Lost access to your authenticator?</p>
          <button
            onClick={sendOtp}
            className="mt-1 text-black underline hover:no-underline"
          >
            Send a code to your email instead
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}