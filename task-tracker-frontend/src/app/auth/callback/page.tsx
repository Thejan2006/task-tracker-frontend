'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseGoogleJwt, saveGoogleUserSession, GoogleUserProfile } from '@/lib/googleAuth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing your sign-in with Google...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function processAuth() {
      // 1. Check Query Parameters
      const searchParams = new URLSearchParams(window.location.search);
      let accessToken = searchParams.get('access_token') || searchParams.get('token');
      let idToken = searchParams.get('id_token');
      const queryError = searchParams.get('error') || searchParams.get('error_description');

      // 2. Check Hash Fragment (standard for Google OAuth implicit flow: #access_token=...&id_token=...)
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (!accessToken) accessToken = hashParams.get('access_token');
        if (!idToken) idToken = hashParams.get('id_token');
        const hashError = hashParams.get('error');
        if (hashError) {
          setIsError(true);
          setMessage(`Authentication error: ${hashError}`);
          return;
        }
      }

      if (queryError) {
        setIsError(true);
        setMessage(`Google sign-in error: ${queryError}`);
        return;
      }

      // If either access_token or id_token is found:
      const primaryToken = accessToken || idToken;

      if (primaryToken) {
        let userProfile: GoogleUserProfile | null = null;

        // Try decoding Google id_token
        if (idToken) {
          userProfile = parseGoogleJwt(idToken);
        }

        // If no user profile from id_token but we have accessToken, fetch Google userinfo
        if (!userProfile && accessToken && accessToken.startsWith('ya29.')) {
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
              userProfile = await res.json();
            }
          } catch {
            // Non-blocking: continue sign in even if userinfo fetch fails
          }
        }

        saveGoogleUserSession(primaryToken, userProfile);

        if (userProfile?.name) {
          setMessage(`Welcome back, ${userProfile.name}! Loading your workspace...`);
        } else {
          setMessage('Sign-in verified! Redirecting to your dashboard...');
        }

        setTimeout(() => {
          router.replace('/dashboard');
        }, 600);
        return;
      }

      setIsError(true);
      setMessage('No authorization token was provided. Please try signing in again.');
    }

    processAuth();
  }, [router]);

  return (
    <main className="glass-page grid min-h-screen place-items-center p-6 text-center text-[var(--text-main)]">
      <div className="glass-card max-w-sm p-8 sm:p-10 shadow-2xl">
        {!isError ? (
          <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
        ) : (
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 text-lg">
            ✕
          </div>
        )}
        <h3 className="text-base font-bold text-[var(--text-main)]">
          {isError ? 'Sign-In Incomplete' : 'Connecting Account'}
        </h3>
        <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{message}</p>
        {isError && (
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="btn-primary-mono mt-6 text-xs py-2.5 px-5 w-full justify-center"
          >
            Return to Sign In →
          </button>
        )}
      </div>
    </main>
  );
}
