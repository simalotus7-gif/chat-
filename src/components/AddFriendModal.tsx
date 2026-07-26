import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  QrCode, 
  Sparkles,
  Users
} from 'lucide-react';

interface AddFriendModalProps {
  onClose: () => void;
  onOpenUserSwitcher: () => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  onClose,
  onOpenUserSwitcher,
}) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://talktribe.app';
  const inviteCode = 'TALK-8829-SL';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3">
          <UserPlus className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-white mb-1">
          Invite Friends to Chat!
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Share this link with your friends so they can join this chat room from their phone or computer!
        </p>

        {/* Shareable Link Box */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Shareable Chat Link
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none px-2 truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Code */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Group Invite Code</p>
              <p className="text-sm font-mono font-bold text-indigo-300">{inviteCode}</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>

        {/* Multi-user Simulator Shortcut */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 mb-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Test Multi-User on 1 Screen</span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Want to test sending messages back and forth as another friend right now?
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenUserSwitcher();
            }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Switch Active Friend / Profile
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};
