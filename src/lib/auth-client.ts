import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
  ],
});

export const {
  signIn,
  signOut,
  useSession,
} = authClient;