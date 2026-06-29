'use client';

import { useRef, useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';
import { auth } from '@/lib/firebase';

export function PhoneSignIn() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  const getRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
    return recaptchaRef.current;
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone, getRecaptcha());
      confirmationRef.current = result;
      setStep('code');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmationRef.current!.confirm(code);
      router.replace('/feed');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError('');
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
  };

  return (
    <div className="space-y-3">
      <div id="recaptcha-container" />

      <button
        type="button"
        onClick={() => { setOpen((v) => !v); reset(); }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
      >
        <Phone className="h-4 w-4" />
        Sign in with Phone
      </button>

      {open && (
        <div className="rounded-lg border border-gray-700 p-4 space-y-3">
          {error && <p className="text-xs text-red-400">{error}</p>}

          {step === 'phone' ? (
            <form onSubmit={sendCode} className="space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380XXXXXXXXX"
                autoComplete="tel"
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send code'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-3">
              <p className="text-sm text-gray-400">Code sent to {phone}</p>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                autoComplete="one-time-code"
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm text-gray-400 transition hover:bg-gray-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
