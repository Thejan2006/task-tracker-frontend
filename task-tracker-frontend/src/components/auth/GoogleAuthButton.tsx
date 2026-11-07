'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  API_URL,
  GOOGLE_LOGIN_PATH,
  getStoredGoogleClientId,
  setStoredGoogleClientId,
  buildGoogleOAuthUrl,
  saveGoogleUserSession,
} from '@/lib/googleAuth';
import toast from 'react-hot-toast';

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  className?: string;
  onSuccess?: () => void;
}

export function GoogleAuthButton({
  mode = 'signin',
  className = '',
  onSuccess,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [activeClientId, setActiveClientId] = useState('');

  useEffect(() => {
    const cid = getStoredGoogleClientId();
    setActiveClientId(cid);
    setCustomClientId(cid);
  }, []);

  const handleGoogleClick = () => {
    const clientId = activeClientId || getStoredGoogleClientId();

    if (clientId) {
      // Direct live Google OAuth 2.0 flow
      setIsLoading(true);
      const redirectUri = `${window.location.origin}/auth/callback`;
      const url = buildGoogleOAuthUrl(clientId, redirectUri);
      window.location.assign(url);
    } else {
      // Prompt modal with options: enter Client ID, try backend /auth/google, or instant demo sign-in
      setShowConfigModal(true);
    }
  };

  const handleSaveClientIdAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientId.trim()) {
      toast.error('Please enter a valid Google Client ID');
      return;
    }
    setStoredGoogleClientId(customClientId.trim());
    setActiveClientId(customClientId.trim());
    setShowConfigModal(false);

    // Launch Google OAuth
    setIsLoading(true);
    const redirectUri = `${window.location.origin}/auth/callback`;
    const url = buildGoogleOAuthUrl(customClientId.trim(), redirectUri);
    window.location.assign(url);
  };

  const handleBackendOAuthRedirect = () => {
    setShowConfigModal(false);
    setIsLoading(true);
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.assign(
      `${API_URL}${GOOGLE_LOGIN_PATH}?redirect_uri=${encodeURIComponent(redirectUri)}`
    );
  };

  const handleInstantDemoSignIn = () => {
    setIsLoading(true);
    setShowConfigModal(false);

    // Mock Google User payload
    const demoUser = {
      sub: 'google_demo_1092837465',
      name: 'Alex Vance (Google)',
      email: 'alex.vance@gmail.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };

    // Store token and profile
    const demoToken = `google_demo_token_${Date.now()}`;
    saveGoogleUserSession(demoToken, demoUser);

    toast.success('Signed in with Google (Demo Mode)');
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className={`btn-ghost-mono w-full justify-center gap-3 py-2.5 text-xs font-semibold rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--canvas-bg)] hover:border-[var(--text-main)] transition-all shadow-xs disabled:opacity-60 ${className}`}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-[var(--text-main)] border-t-transparent animate-spin" />
        ) : (
          /* Official Google 4-color SVG mark */
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>
          {isLoading
            ? 'Connecting to Google...'
            : mode === 'signup'
            ? 'Sign up with Google'
            : 'Continue with Google'}
        </span>
      </button>

      {/* ── GOOGLE CONFIG & SIGN-IN MODAL ── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="organizo-card w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <h3 className="font-bold text-sm text-[var(--text-main)]">Google Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              To connect live with Google OAuth, provide your <strong>Google Client ID</strong> from the Google Cloud Console. Or test instantly using demo mode.
            </p>

            {/* Option 1: Instant Demo Sign-In */}
            <div className="rounded-2xl p-4 bg-[var(--canvas-bg)] border border-[var(--card-border)]">
              <span className="text-[11px] font-bold text-[var(--text-main)] block mb-1">
                Option 1: Quick Test Sign-In
              </span>
              <p className="text-[10px] text-[var(--text-muted)] mb-3">
                Instantly signs you in as a verified Google user without requiring Google Cloud Console credentials.
              </p>
              <button
                type="button"
                onClick={handleInstantDemoSignIn}
                className="btn-primary-mono w-full py-2 text-xs justify-center"
              >
                Instant Google Sign-In (Demo) →
              </button>
            </div>

            {/* Option 2: Custom Client ID */}
            <form onSubmit={handleSaveClientIdAndContinue} className="space-y-3">
              <span className="text-[11px] font-bold text-[var(--text-main)] block">
                Option 2: Live Google Cloud Client ID
              </span>
              <div>
                <input
                  type="text"
                  placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  className="search-pill text-xs py-2 w-full rounded-xl"
                />
                <span className="text-[9px] text-[var(--text-subtle)] mt-1 block">
                  Redirect URI to whitelist in Google Console: <code className="font-mono">{typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}</code>
                </span>
              </div>
              <button
                type="submit"
                className="btn-ghost-mono w-full py-2 text-xs justify-center font-bold"
              >
                Save Client ID & Launch Google →
              </button>
            </form>

            {/* Option 3: Backend /auth/google Redirect */}
            <div className="pt-2 border-t border-[var(--card-border)] flex justify-between items-center text-xs">
              <span className="text-[10px] text-[var(--text-subtle)]">Backend endpoint:</span>
              <button
                type="button"
                onClick={handleBackendOAuthRedirect}
                className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:underline"
              >
                Try {API_URL}{GOOGLE_LOGIN_PATH} →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
