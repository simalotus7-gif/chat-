import React, { useState } from 'react';
import { X, Users, Check, Plus, UserPlus, Sparkles, UserX } from 'lucide-react';
import { User } from '../types';

interface UserSwitcherProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onCreateCustomUser: (name: string, customStatus: string) => void;
  onOpenGoogleAuth: () => void;
  onClose: () => void;
  onRemoveUser?: (userId: string) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  users,
  currentUser,
  onSwitchUser,
  onCreateCustomUser,
  onOpenGoogleAuth,
  onClose,
  onRemoveUser,
}) => {
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendStatus, setNewFriendStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    onCreateCustomUser(newFriendName.trim(), newFriendStatus.trim());
    setNewFriendName('');
    setNewFriendStatus('');
    setShowAddForm(false);
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
          <Users className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-white mb-1">
          Switch Friend Profile
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Select a friend to switch into their perspective and send messages back and forth in real-time!
        </p>

        {/* Google Account Login Action */}
        <button
          onClick={() => {
            onClose();
            onOpenGoogleAuth();
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 mb-4 shadow-sm transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.21 21.32 7.32 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.14 0 9.99 0 12s.44 3.86 1.23 5.42l4.05-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.68 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          Sign In with Google Account
        </button>

        {/* Existing Friends List */}
        <div className="space-y-2 mb-5 max-h-60 overflow-y-auto custom-scrollbar">
          {users.map((u) => {
            const isSelected = u.id === currentUser.id;

            return (
              <button
                key={u.id}
                onClick={() => {
                  onSwitchUser(u);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        u.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>

                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-xs text-slate-100 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {u.customStatus || u.bio || `@${u.id}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-white mr-1">
                        Switch
                      </span>
                      {onRemoveUser && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveUser(u.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs"
                          title="Remove User"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Custom Friend Form */}
        {showAddForm ? (
          <form onSubmit={handleCreateFriend} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 mb-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Create New Friend Profile
            </h3>
            <input
              type="text"
              placeholder="Friend's Name (e.g. Sajith, Malini)"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Status (e.g. 🇱🇰 Chilling in Kandy)"
              value={newFriendStatus}
              onChange={(e) => setNewFriendStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white"
              >
                Add Friend
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800/50 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 mb-4 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Custom Friend Profile
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          Done
        </button>
      </div>
    </div>
  );
};
