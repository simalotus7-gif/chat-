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
  Shield
} from 'lucide-react';
import { User, UserStatus } from '../types';

interface ProfileModalProps {
  currentUser: User;
  onSaveProfile: (updated: Partial<User>) => void;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
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
        <p className="text-xs text-slate-400 mb-6">
          Customize how your friends see you in rooms and direct messages.
        </p>

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
