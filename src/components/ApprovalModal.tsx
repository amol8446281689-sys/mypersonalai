import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  title: string;
  details: string;
  onApprove: () => void;
  onDeny: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  title,
  details,
  onApprove,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#121d30] border border-[#26364f] rounded-xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2b2417] border border-[#e9b65d]/40 flex items-center justify-center text-[#f3dcae] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#e9b65d]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#e8eef8] m-0">{title}</h3>
            <p className="text-xs text-[#9aabc3] mt-0.5">
              Owner confirmation required before proceeding.
            </p>
          </div>
        </div>

        <div className="my-4 p-3 rounded-lg bg-[#0b1525] border border-[#26364f] text-xs font-mono text-[#e8eef8] whitespace-pre-wrap break-words">
          {details}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onDeny}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#26364f] bg-[#1b2b43] hover:bg-[#253958] text-[#e8eef8] cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#ff9e9e]" />
            <span>Deny</span>
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#73d6c4] hover:bg-[#5fc5b2] text-[#08201c] cursor-pointer transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
