import React from 'react';
import { 
  X, 
  MessageSquare, 
  UserPlus, 
  Sparkles, 
  ShieldCheck,
  Circle
} from 'lucide-react';
import { User } from '../types';

interface MembersListProps {
  users: User[];
  channelMembers: string[];
  currentUser: User;
  onClose: () => void;
  onStartDirectMessage: (targetUser: User) => void;
  onOpenAddFriend: () => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  users,
  channelMembers,
  currentUser,
  onClose,
  onStartDirectMessage,
  onOpenAddFriend,
}) => {
  const channelUsers = users.filter((u) => channelMembers.includes(u.id));

  const onlineMembers = channelUsers.filter((u) => u.status === 'online');
  const idleMembers = channelUsers.filter((u) => u.status === 'idle' || u.status === 'dnd');
  const offlineMembers = channelUsers.filter((u) => u.status === 'offline');

  const renderUserCard = (u: User) => {
    const isMe = u.id === currentUser.id;

    return (
      <div
        key={u.id}
        className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative flex-shrink-0">
            <img
              src={u.avatar}
              alt={u.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                u.status === 'online'
                  ? 'bg-emerald-500'
                  : u.status === 'idle'
                  ? 'bg-amber-500'
                  : u.status === 'dnd'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}
            />
          </div>

          <div className="overflow-hidden leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                {u.name}
              </span>
              {isMe && (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 rounded font-semibold">
                  You
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {u.customStatus || u.bio || `@${u.id}`}
            </p>
          </div>
        </div>

        {!isMe && (
          <button
            onClick={() => onStartDirectMessage(u)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs"
            title={`Message ${u.name}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none flex-shrink-0">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <span>Members</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {channelUsers.length}
          </span>
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Member Lists by Status */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        {/* ONLINE */}
        {onlineMembers.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 mb-1">
              Online — {onlineMembers.length}
            </p>
            <div className="space-y-0.5">
              {onlineMembers.map(renderUserCard)}
            </div>
          </div>
        )}

        {/* IDLE / AWAY */}
        {idleMembers.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 mb-1">
              Away — {idleMembers.length}
            </p>
            <div className="space-y-0.5">
              {idleMembers.map(renderUserCard)}
            </div>
          </div>
        )}

        {/* OFFLINE */}
        {offlineMembers.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
              Offline — {offlineMembers.length}
            </p>
            <div className="space-y-0.5">
              {offlineMembers.map(renderUserCard)}
            </div>
          </div>
        )}
      </div>

      {/* Invite Friends Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={onOpenAddFriend}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Friends
        </button>
      </div>
    </div>
  );
};
