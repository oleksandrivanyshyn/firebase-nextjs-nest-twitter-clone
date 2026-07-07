'use client';

import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const RESEND_COOLDOWN_MS = 60_000;

export function EmailVerificationBanner() {
  const { user } = useAuthContext();
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  if (!user || !user.email || user.emailVerified) return null;

  const onResend = async () => {
    if (sending || justSent) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent');
      setJustSent(true);
      setTimeout(() => setJustSent(false), RESEND_COOLDOWN_MS);
    } catch {
      toast.error('Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-yellow-900/50 bg-yellow-900/20 px-4 py-2 text-sm text-yellow-300">
      <Mail className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        Please verify your email address to unlock all features.
      </span>
      <button
        type="button"
        onClick={onResend}
        disabled={sending || justSent}
        className="shrink-0 rounded-full border border-yellow-700 px-3 py-1 text-xs font-semibold transition hover:bg-yellow-900/40 disabled:opacity-50"
      >
        {justSent ? 'Sent' : sending ? 'Sending…' : 'Resend'}
      </button>
    </div>
  );
}
