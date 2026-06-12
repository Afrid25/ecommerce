"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

// Mobile OTP Login temporarily disabled.
// Re-enable when Firebase billing/production SMS support is configured.

function normalizeBangladeshPhone(value: string) {
  const compact = value.replace(/[\s-]/g, "");

  if (/^01[3-9]\d{8}$/.test(compact)) {
    return `+88${compact}`;
  }

  if (/^\+8801[3-9]\d{8}$/.test(compact)) {
    return compact;
  }

  if (/^8801[3-9]\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  return null;
}

export default function PhoneLoginForm() {
  const router = useRouter();
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getVerifier = () => {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new Error("Firebase phone authentication is not configured yet.");
    }

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "firebase-phone-recaptcha",
        {
          size: "invisible",
        }
      );
    }

    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isFirebaseConfigured) {
      setError("Firebase is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values first.");
      return;
    }

    const normalizedPhone = normalizeBangladeshPhone(phone);
    if (!normalizedPhone) {
      setError("Enter a valid Bangladesh mobile number, for example 018XXXXXXXX.");
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Firebase auth is not available.");
      return;
    }

    setLoading(true);

    try {
      const verifier = getVerifier();
      confirmationResultRef.current = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        verifier
      );
      setOtpSent(true);
      setSuccess(`OTP sent to ${normalizedPhone}.`);
    } catch (sendError) {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      setError(sendError instanceof Error ? sendError.message : "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!confirmationResultRef.current) {
      setError("Please request an OTP first.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      await confirmationResultRef.current.confirm(otp.trim());
      setSuccess("Phone number verified. Redirecting to shop...");
      router.push("/shop");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Mobile OTP login</p>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#16311a]">
          Firebase
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
        Use a Bangladesh mobile number. Local format like 018XXXXXXXX will be sent as +88018XXXXXXXX.
      </p>

      {error ? (
        <div className="mt-3 rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-3 rounded-[14px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-700">
          {success}
        </div>
      ) : null}

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="mt-4 grid gap-3">
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="018XXXXXXXX"
            className="min-h-12 w-full rounded-[14px] border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[#FF6A00]"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-[14px] bg-[#FF6A00] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-4 grid gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            className="min-h-12 w-full rounded-[14px] border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[#FF6A00]"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-[14px] bg-[#16311a] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setSuccess("");
              setError("");
            }}
            className="min-h-11 w-full rounded-[14px] border border-[var(--border)] px-4 text-sm font-semibold"
          >
            Change number
          </button>
        </form>
      )}

      <div id="firebase-phone-recaptcha" />
    </div>
  );
}
