import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Mail, 
  Copy, 
  Check, 
  Users, 
  Send,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AddFriendModalProps {
  onClose: () => void;
  onOpenUserSwitcher: () => void;
  onAddContactByEmail: (email: string, name?: string) => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  onClose,
  onOpenUserSwitcher,
  onAddContactByEmail,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://talktribe.app';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    onAddContactByEmail(email.trim(), name.trim());
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-whatsapp-panel border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-700/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
          <UserPlus className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-white mb-1">
          Add Person by Email
        </h2>
        <p className="text-xs text-slate-300 mb-5">
          Enter any email address to add them directly to your WhatsApp chat list and start messaging.
        </p>

        {addedSuccess ? (
          <div className="p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2 mb-4 animate-scale-up">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-slate-100 text-sm">Contact Added!</h3>
            <p className="text-xs text-emerald-200">Opening chat with {email}...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Friend's Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. friend@gmail.com"
                  className="w-full bg-whatsapp-dark border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chathura or Nimal"
                className="w-full bg-whatsapp-dark border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              <span>Add Contact & Start Chat</span>
            </button>
          </form>
        )}

        {/* Share Invite Link Option */}
        <div className="pt-4 border-t border-slate-700/60 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Or Copy Direct Invite Link
            </label>
            <div className="flex items-center gap-2 bg-whatsapp-dark border border-slate-700 rounded-xl p-1.5">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none px-2 truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Test Multi-user Switcher */}
        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Testing on 1 screen?</span>
          <button
            onClick={() => {
              onClose();
              onOpenUserSwitcher();
            }}
            className="text-emerald-400 font-bold hover:underline"
          >
            Switch Active Profile
          </button>
        </div>
      </div>
    </div>
  );
};
