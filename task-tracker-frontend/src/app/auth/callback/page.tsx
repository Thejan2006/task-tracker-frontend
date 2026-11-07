'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing your sign-in...');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('access_token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      router.replace('/dashboard');
      return;
    }

    setMessage(error ?? 'Authentication could not be completed.');
  }, [router]);

  return (
    <main className="glass-page grid min-h-screen place-items-center p-6 text-center text-[var(--text-main)]">
      <div className="glass-card max-w-sm p-8 shadow-xl">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
        <h3 className="text-sm font-bold text-[var(--text-main)]">Authenticating</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{message}</p>
        {message !== 'Completing your sign-in...' && (
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="btn-primary-mono mt-5 text-xs py-2 px-4"
          >
            Return to sign in
          </button>
        )}
      </div>
    </main>
  );
}
