import React from 'react';
import { Terminal, LogOut, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  authenticated: boolean;
  onLogout: () => void;
  providerStatus: string;
}

export const Header: React.FC<HeaderProps> = ({ authenticated, onLogout, providerStatus }) => {
  return (
    <header className="flex justify-between items-center px-5 py-3 border-b border-[#26364f] bg-[#0d1627] text-[#e8eef8] sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1b2b43] border border-[#26364f] flex items-center justify-center text-[#73d6c4] font-mono font-bold shadow-sm">
          ⌘
        </div>
        <div className="flex items-baseline gap-2">
          <strong className="text-base sm:text-lg font-semibold tracking-tight text-[#e8eef8]">
            MyPersonalAI
          </strong>
          <span className="text-xs text-[#9aabc3] font-mono px-1.5 py-0.5 rounded bg-[#121d30] border border-[#26364f]">
            Engineer v2
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#9aabc3] px-3 py-1 rounded-full border border-[#26364f] bg-[#121d30]">
          <span className="w-2 h-2 rounded-full bg-[#73d6c4] animate-pulse"></span>
          <span className="hidden sm:inline font-mono">{providerStatus}</span>
          <span className="sm:hidden font-mono">Ready</span>
        </div>

        {authenticated && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[#26364f] bg-[#1b2b43] hover:bg-[#253958] text-[#e8eef8] transition-colors cursor-pointer"
            title="Sign out of private session"
          >
            <LogOut className="w-3.5 h-3.5 text-[#9aabc3]" />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
};
