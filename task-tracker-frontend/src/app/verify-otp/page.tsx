'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const VERIFY_OTP_PATH = process.env.NEXT_PUBLIC_VERIFY_OTP_PATH ?? '/otp/verify-otp';
const RESEND_OTP_PATH = process.env.NEXT_PUBLIC_RESEND_OTP_PATH ?? '/otp/resend-otp';

function messageFromPayload(payload: unknown, fallback: string) {
  if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
    const detail = payload.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return 'Please check the verification code and try again.';
  }
  return fallback;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email') ?? '');
    firstInput.current?.focus();
  }, []);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}${VERIFY_OTP_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: code.trim() }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(messageFromPayload(payload, 'That code is not valid. Please try again.'));
      }

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'access_token' in payload &&
        typeof payload.access_token === 'string'
      ) {
        localStorage.setItem('token', payload.access_token);
        router.push('/dashboard');
      } else {
        router.push('/login?verified=true');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to verify your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    setIsResending(true);
    try {
      const response = await fetch(`${API_URL}${RESEND_OTP_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(messageFromPayload(payload, 'We could not resend the code.'));
      }
      setNotice('A fresh verification code was sent to your inbox.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to resend the code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="glass-page flex min-h-screen items-center justify-center p-4 sm:p-6 text-[var(--text-main)]">
      <motion.div
        className="glass-card relative z-10 w-full max-w-md p-8 sm:p-10 shadow-2xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs">
            AZ
          </span>
          Organizo
        </Link>

        <div className="mt-8">
          <span className="eyebrow">Verification</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-main)]">Check your inbox</h1>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            We sent a verification code to <span className="font-semibold text-[var(--text-main)]">{email || 'your email'}</span>.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {notice && (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            {notice}
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
              Verification Code
            </label>
            <input
              ref={firstInput}
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              disabled={isSubmitting}
              className="search-pill text-center font-mono text-2xl tracking-[0.25em] font-bold py-3 rounded-2xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="btn-primary-mono w-full justify-center py-2.5 text-xs"
          >
            {isSubmitting ? 'Verifying...' : 'Confirm Code & Enter →'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-[var(--text-muted)]">
          <div>
            Didn&apos;t get the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !email}
              className="font-semibold text-[var(--text-main)] hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
          <Link href="/users/create" className="text-[var(--text-subtle)] hover:text-[var(--text-main)]">
            Use a different email address
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
