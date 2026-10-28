import React from 'react';
import { Bot, FileCode, Settings, Sparkles, Shield, HardDrive } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  filesCount: number;
  lessonsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  filesCount,
  lessonsCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'chat',
      label: 'AI Engineer',
      icon: <Sparkles className="w-4 h-4 text-[#73d6c4]" />,
    },
    {
      id: 'files',
      label: 'Code workspace',
      icon: <FileCode className="w-4 h-4 text-[#73d6c4]" />,
      badge: `${filesCount}`,
    },
    {
      id: 'settings',
      label: 'Setup & status',
      icon: <Settings className="w-4 h-4 text-[#73d6c4]" />,
      badge: lessonsCount > 0 ? `${lessonsCount} lessons` : undefined,
    },
  ];

  return (
    <aside className="bg-[#121d30] border border-[#26364f] rounded-xl p-3 flex flex-col justify-between h-full">
      <div className="space-y-1.5">
        <div className="px-2 py-1 text-[11px] font-mono tracking-wider uppercase text-[#9aabc3]">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b2b43] border border-[#73d6c4] text-[#73d6c4] font-medium shadow-sm'
                  : 'text-[#e8eef8] border border-transparent hover:bg-[#18263c] hover:border-[#26364f]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#0b1220] border border-[#26364f] text-[#9aabc3]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#26364f] mt-4">
        <div className="p-2.5 rounded-lg bg-[#0b1525] border border-[#26364f] text-[#9aabc3] text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[#e8eef8] font-medium">
            <Shield className="w-3.5 h-3.5 text-[#73d6c4]" />
            <span>Sandboxed Session</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#9aabc3]">
            Local-first • self-hostable • private session
          </p>
        </div>
      </div>
    </aside>
  );
};
