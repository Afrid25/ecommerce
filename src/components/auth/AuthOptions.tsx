"use client";

import Link from "next/link";
import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import { signIn } from "@/lib/auth-client";

type AuthOptionsProps = {
  googleAuthEnabled: boolean;
  phoneAuthEnabled: boolean;
  redirectTo?: string;
  onError?: (message: string) => void;
  onGoogleLoading?: (loading: boolean) => void;
  googleLoading?: boolean;
  showGuest?: boolean;
};

export default function AuthOptions({
  googleAuthEnabled,
  phoneAuthEnabled,
  redirectTo = "/profile",
  onError,
  onGoogleLoading,
  googleLoading = false,
  showGuest = true,
}: AuthOptionsProps) {
  // Mobile OTP Login temporarily disabled.
  // Re-enable when Firebase billing/production SMS support is configured.
  const shouldRenderPhoneLogin =
    process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED === "true" && phoneAuthEnabled;

  const handleGoogle = async () => {
    if (!googleAuthEnabled) {
      onError?.("Google sign-in is not configured yet.");
      return;
    }

    onGoogleLoading?.(true);
    onError?.("");

    try {
      await signIn.social({
        provider: "google",
        callbackURL: redirectTo,
        newUserCallbackURL: redirectTo,
      });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Google sign-in failed");
      onGoogleLoading?.(false);
    }
  };

  return (
    <div className="grid gap-3">
      {showGuest ? (
        <Link
          href="/shop"
          className="flex w-full items-center justify-center rounded-[18px] bg-[#FF6A00] px-5 py-4 text-sm font-semibold text-white"
        >
          Continue as Guest
        </Link>
      ) : null}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || !googleAuthEnabled}
        className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-white px-5 py-4 text-left text-sm font-semibold text-[#16311a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {googleAuthEnabled ? "Ready" : "Not configured"}
        </span>
      </button>

      {shouldRenderPhoneLogin && <PhoneLoginForm />}
    </div>
  );
}
