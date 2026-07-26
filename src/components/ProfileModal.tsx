import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Camera, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  Smile,
  Shield,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { User, UserStatus } from '../types';

interface ProfileModalProps {
  currentUser: User;
  onSaveProfile: (updated: Partial<User>) => void;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onOpenGoogleAuth?: () => void;
  onOpenResetModal?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  onSaveProfile,
  onClose,
  soundEnabled,
  onToggleSound,
  onOpenGoogleAuth,
  onOpenResetModal,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [customStatus, setCustomStatus] = useState(currentUser.customStatus || '');
  const [bio, setBio] = useState(currentUser.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || currentUser.name,
      avatar,
      status,
      customStatus: customStatus.trim(),
      bio: bio.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Edit My Profile & Status
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Customize how your friends see you in rooms and direct messages.
        </p>

        {/* Google Account Connection Banner */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.21 21.32 7.32 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.14 0 9.99 0 12s.44 3.86 1.23 5.42l4.05-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.68 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <div>
              <p className="text-xs font-bold text-white">Google Account</p>
              <p className="text-[10px] text-blue-200">
                {currentUser.id.startsWith('google_')
                  ? 'Connected with Google'
                  : 'Link your Google account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenGoogleAuth) onOpenGoogleAuth();
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            {currentUser.id.startsWith('google_') ? 'Switch Google Account' : 'Sign in with Google'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Choose Avatar
            </label>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-14 h-14 rounded-full object-cover ring-4 ring-indigo-500/40 shadow-md"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-200">Avatar Presets</p>
                <div className="flex items-center gap-2 mt-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatar(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                        avatar === url ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Online Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Presence Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'online', label: 'Online', color: 'bg-emerald-500' },
                { id: 'idle', label: 'Away', color: 'bg-amber-500' },
                { id: 'dnd', label: 'Do Not Disturb', color: 'bg-rose-500' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStatus(item.id as UserStatus)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    status === item.id
                      ? 'bg-indigo-600/30 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Status Message */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Custom Status Message
            </label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="e.g. 🇱🇰 Having Tea & Chatting with friends"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              About Me (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Short description about yourself..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Sound Notification Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-200">Chat Sound Effects</p>
                <p className="text-[10px] text-slate-400">Play subtle audio pops for messages</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleSound(!soundEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* System Factory Reset Option */}
          {onOpenResetModal && (
            <div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="text-xs font-bold text-rose-200">Factory Reset Site (PIN: 0000)</p>
                  <p className="text-[10px] text-rose-300/80">
                    Wipe all messages, channels & reset to clean state
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenResetModal();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Site
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
