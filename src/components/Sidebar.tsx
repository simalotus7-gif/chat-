import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users, 
  Search, 
  Volume2, 
  UserPlus, 
  Star,
  Sparkles,
  Lock,
  Globe,
  MoreVertical,
  Circle,
  MessageCircle
} from 'lucide-react';
import { Channel, User, VoiceParticipant } from '../types';

interface SidebarProps {
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  currentUser: User;
  onOpenProfile: () => void;
  onOpenCreateChannel: () => void;
  onOpenAddFriend: () => void;
  onOpenUserSwitcher: () => void;
  onOpenGoogleAuth: () => void;
  activeVoiceRoom?: {
    channelId: string;
    channelName: string;
    participants: VoiceParticipant[];
  };
  onLeaveVoice: () => void;
  onToggleMuteVoice: () => void;
  isVoiceMuted: boolean;
  activeTab: 'channels' | 'friends' | 'starred';
  setActiveTab: (tab: 'channels' | 'friends' | 'starred') => void;
  starredCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  currentUser,
  onOpenProfile,
  onOpenCreateChannel,
  onOpenAddFriend,
  onOpenUserSwitcher,
  onOpenGoogleAuth,
  activeVoiceRoom,
  onLeaveVoice,
  onToggleMuteVoice,
  isVoiceMuted,
  activeTab,
  setActiveTab,
  starredCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'groups' | 'starred'>('all');

  const groupChannels = channels.filter(c => c.type !== 'direct');
  const directChannels = channels.filter(c => c.type === 'direct');

  let displayChannels = channels;
  if (filter === 'groups') {
    displayChannels = groupChannels;
  } else if (filter === 'starred') {
    displayChannels = channels.filter(c => c.isPinned);
  }

  const filteredChannels = displayChannels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-80 bg-whatsapp-dark text-slate-200 flex flex-col h-full border-r border-slate-800/80 select-none flex-shrink-0">
      {/* WhatsApp Top Header Bar */}
      <div className="h-16 px-4 bg-whatsapp-panel flex items-center justify-between border-b border-slate-800/60">
        {/* Current User Profile Avatar */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Profile & Settings"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/80 group-hover:ring-emerald-400 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-whatsapp-panel" />
          </div>
          <div className="hidden sm:block overflow-hidden leading-none">
            <h1 className="font-bold text-slate-100 text-sm truncate group-hover:text-emerald-400 transition-colors">
              {currentUser.name}
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              WhatsApp Connected
            </p>
          </div>
        </div>

        {/* WhatsApp Action Buttons */}
        <div className="flex items-center gap-1 text-slate-300">
          {/* Google Sign In Pill */}
          <button
            onClick={onOpenGoogleAuth}
            title="Continue with Google Account"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all active:scale-95 mr-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.21 21.32 7.32 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.14 0 9.99 0 12s.44 3.86 1.23 5.42l4.05-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.68 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Google</span>
          </button>

          {/* Add Friend by Email */}
          <button
            onClick={onOpenAddFriend}
            title="Add Person by Email"
            className="p-2 rounded-full hover:bg-slate-700/60 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
          </button>

          {/* New Channel / Group */}
          <button
            onClick={onOpenCreateChannel}
            title="New Group / Channel"
            className="p-2 rounded-full hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Settings / Menu */}
          <button
            onClick={onOpenProfile}
            title="Settings & Reset Options"
            className="p-2 rounded-full hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* WhatsApp Search Bar */}
      <div className="p-2.5 bg-whatsapp-dark border-b border-slate-800/40">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-whatsapp-panel text-slate-100 text-xs pl-10 pr-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-400"
          />
        </div>

        {/* WhatsApp Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 px-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-whatsapp-panel text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('groups')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'groups'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-whatsapp-panel text-slate-400 hover:text-slate-200'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              filter === 'starred'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-whatsapp-panel text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            Starred
          </button>
        </div>
      </div>

      {/* WhatsApp Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/40">
        {filteredChannels.map((ch) => {
          const isActive = activeChannelId === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => {
                onSelectChannel(ch.id);
                setActiveTab('channels');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all relative ${
                isActive
                  ? 'bg-[#2a3942] border-l-4 border-emerald-500'
                  : 'hover:bg-slate-800/50'
              }`}
            >
              {/* Channel / DM Avatar Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
                  {ch.type === 'direct' ? (
                    ch.name.substring(0, 2).toUpperCase()
                  ) : (
                    <span>{ch.icon || '💬'}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-whatsapp-dark" />
              </div>

              {/* Chat Content Preview */}
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-100 text-sm truncate flex items-center gap-1.5">
                    {ch.name}
                    {ch.type === 'private_group' && (
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                  </h3>
                  <span className="text-[10px] text-emerald-400/90 font-medium shrink-0">
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate leading-tight">
                  {ch.description || 'Tap to start chatting on TalkTribe...'}
                </p>
              </div>
            </button>
          );
        })}

        {filteredChannels.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No chats found matching your search.
          </div>
        )}
      </div>

      {/* Active Voice Call Dock (if joined) */}
      {activeVoiceRoom && (
        <div className="p-2.5 m-2 bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-300 truncate">
                WhatsApp Voice Call
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                #{activeVoiceRoom.channelName} • {activeVoiceRoom.participants.length} connected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMuteVoice}
              className={`p-2 rounded-xl text-xs transition-colors ${
                isVoiceMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-200'
              }`}
              title={isVoiceMuted ? 'Unmute' : 'Mute'}
            >
              {isVoiceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={onLeaveVoice}
              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              title="Leave Call"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Multi-User Switcher Banner */}
      <div className="px-3 py-2 bg-whatsapp-panel border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          Test Multi-User Account:
        </span>
        <button
          onClick={onOpenUserSwitcher}
          className="text-emerald-400 font-bold hover:underline"
        >
          Switch User
        </button>
      </div>
    </div>
  );
};

