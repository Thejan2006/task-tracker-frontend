'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const VERIFY_OTP_PATH = process.env.NEXT_PUBLIC_VERIFY_OTP_PATH ?? '/verify-otp';
const RESEND_OTP_PATH = process.env.NEXT_PUBLIC_RESEND_OTP_PATH ?? '/resend-otp';

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
      setNotice('A new verification code is on its way.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to resend the code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080812] px-4 py-10 text-[#f8f7ff]">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 shadow-lg shadow-violet-500/30">T</span>
          Taskflow
        </Link>
        <div className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Almost there</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Verify your email</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enter the code we sent to <span className="font-medium text-slate-200">{email || 'your email address'}</span>.
          </p>
        </div>
        {error && <div role="alert" className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
        {notice && <div role="status" className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{notice}</div>}
        <form onSubmit={handleVerify} className="mt-7 space-y-5">
          <label htmlFor="otp" className="block text-sm font-medium text-slate-300">
            Verification code
            <input
              ref={firstInput}
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{4,8}"
              maxLength={8}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="Enter your code"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-center text-2xl font-semibold tracking-[0.45em] text-white outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 disabled:opacity-60"
            />
          </label>
          <button type="submit" disabled={isSubmitting || !email} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-violet-700 px-4 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:shadow-violet-600/30 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Didn&apos;t receive it?{' '}
          <button type="button" onClick={handleResend} disabled={isResending || !email} className="font-semibold text-violet-300 hover:text-violet-200 disabled:opacity-50">
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
        </p>
        <Link href="/users/create" className="mt-5 block text-center text-sm text-slate-500 transition hover:text-slate-300">Use a different email</Link>
      </section>
    </main>
  );
}
