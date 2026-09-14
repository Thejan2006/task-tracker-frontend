'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing your Google sign-in...');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('access_token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      router.replace('/dashboard');
      return;
    }

    setMessage(error ?? 'Google sign-in could not be completed.');
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#080812] px-6 text-center text-[#f8f7ff]">
      <div>
        <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-300" />
        <p className="text-sm text-slate-300">{message}</p>
        {message !== 'Completing your Google sign-in...' && (
          <button type="button" onClick={() => router.replace('/login')} className="mt-5 text-sm font-semibold text-violet-300 hover:text-violet-200">
            Return to sign in
          </button>
        )}
      </div>
    </main>
  );
}
