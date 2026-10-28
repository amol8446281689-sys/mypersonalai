import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (attempts >= 8) {
      setError('Too many failed sign-in attempts. Please wait 15 minutes or use developer bypass.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await onLogin(password);
      if (!result.success) {
        setAttempts((prev) => prev + 1);
        setError(result.error || 'Password is incorrect.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failure');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultDevPassword = () => {
    setPassword('admin12345678');
    setError('');
  };

  return (
    <div className="max-w-[440px] mx-auto my-12 p-6 sm:p-8 bg-[#121d30] border border-[#26364f] rounded-2xl shadow-2xl text-[#e8eef8]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#1b2b43] border border-[#26364f] flex items-center justify-center text-[#73d6c4]">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#e8eef8] m-0">Private workspace</h1>
          <p className="text-xs text-[#9aabc3] mt-0.5">Isolated developer environment</p>
        </div>
      </div>

      <p className="text-sm text-[#9aabc3] mb-6 leading-relaxed">
        Sign in with the administrator password configured on your server to unlock AI assistance and workspace file editing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="text-xs font-medium text-[#e8eef8]">
              Administrator Password
            </label>
            <span className="text-[11px] text-[#9aabc3] font-mono">Min 12 characters</span>
          </div>
          <div className="relative">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong workspace password…"
              className="w-full bg-[#0b1525] text-[#e8eef8] border border-[#26364f] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#73d6c4] transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#2b1717] border border-[#ff6b6b]/40 text-[#ff9e9e] text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || password.length < 12}
          className="w-full bg-[#73d6c4] hover:bg-[#5fc5b2] text-[#08201c] font-semibold text-sm py-2.5 rounded-lg border border-[#73d6c4] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span>Verifying session…</span>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#26364f] space-y-3">
        <div className="flex items-center justify-between text-xs text-[#9aabc3]">
          <span>Developer test quick-login:</span>
          <button
            type="button"
            onClick={fillDefaultDevPassword}
            className="text-[#73d6c4] hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>Use default (admin12345678)</span>
          </button>
        </div>

        <p className="text-[11px] text-[#9aabc3] leading-normal">
          Security note: Your password is validated via safe runtime verification. It is not saved in plain browser storage.
        </p>
      </div>
    </div>
  );
};
