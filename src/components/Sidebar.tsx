import React, { useState } from 'react';
import { 
  Hash, 
  Plus, 
  MessageSquare, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Volume2, 
  UserPlus, 
  Star,
  Sparkles,
  Lock,
  Globe
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
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupChannels = channels.filter(c => c.type !== 'direct');
  const directChannels = channels.filter(c => c.type === 'direct');

  const filteredGroupChannels = groupChannels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDirectChannels = directChannels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColorMap = {
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-slate-400',
  };

  return (
    <div className="w-72 bg-slate-900 text-slate-200 flex flex-col h-full border-r border-slate-800 select-none flex-shrink-0">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base flex items-center gap-1.5">
              TalkTribe
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Chat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenGoogleAuth}
            title="Sign in with Google Account"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white transition-colors border border-blue-500/30 text-xs font-semibold"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.21 21.32 7.32 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.14 0 9.99 0 12s.44 3.86 1.23 5.42l4.05-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.68 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Google</span>
          </button>
          <button
            onClick={onOpenAddFriend}
            title="Invite Friends / Add Friend"
            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabs (Channels / Friends / Starred) */}
      <div className="px-3 pt-3 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'channels'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'friends'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Friends
        </button>
        <button
          onClick={() => setActiveTab('starred')}
          className={`py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            activeTab === 'starred'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Starred Messages"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {starredCount > 0 && (
            <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1 rounded-full font-bold">
              {starredCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter rooms or friends..."
            className="w-full bg-slate-950/60 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Channel & Direct Message List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 custom-scrollbar">
        {/* GROUP CHANNELS SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1 group">
            <button
              onClick={() => toggleCategory('channels')}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              {collapsedCategories['channels'] ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              Group Rooms ({filteredGroupChannels.length})
            </button>
            <button
              onClick={onOpenCreateChannel}
              title="Create New Channel"
              className="text-slate-400 hover:text-indigo-400 p-0.5 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {!collapsedCategories['channels'] && (
            <div className="space-y-0.5">
              {filteredGroupChannels.map((ch) => {
                const isActive = activeChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onSelectChannel(ch.id);
                      setActiveTab('channels');
                    }}
                    className={`w-full group/btn flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{ch.icon || '#'}</span>
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.type === 'private_group' ? (
                      <Lock className="w-3 h-3 text-amber-400/80 flex-shrink-0" />
                    ) : (
                      <Globe className="w-3 h-3 text-slate-500 group-hover/btn:text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
              {filteredGroupChannels.length === 0 && (
                <p className="text-[11px] text-slate-500 px-2 py-1 italic">
                  No rooms found
                </p>
              )}
            </div>
          )}
        </div>

        {/* DIRECT MESSAGES SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <button
              onClick={() => toggleCategory('dms')}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              {collapsedCategories['dms'] ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              Direct Messages ({filteredDirectChannels.length})
            </button>
          </div>

          {!collapsedCategories['dms'] && (
            <div className="space-y-0.5">
              {filteredDirectChannels.map((ch) => {
                const isActive = activeChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onSelectChannel(ch.id);
                      setActiveTab('channels');
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] overflow-hidden">
                        {ch.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
                    </div>
                    <span className="truncate flex-1 text-left">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Voice Call Dock (if joined) */}
      {activeVoiceRoom && (
        <div className="p-2.5 mx-2 my-1.5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-300 truncate">
                Voice Call Connected
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                #{activeVoiceRoom.channelName} • {activeVoiceRoom.participants.length} connected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMuteVoice}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isVoiceMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVoiceMuted ? 'Unmute' : 'Mute'}
            >
              {isVoiceMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onLeaveVoice}
              className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
              title="Leave Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* User Simulator / Switcher Helper Banner */}
      <div className="px-3 py-1.5 bg-indigo-950/40 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 flex items-center gap-1">
          <Users className="w-3 h-3 text-indigo-400" />
          Test Multi-User:
        </span>
        <button
          onClick={onOpenUserSwitcher}
          className="text-indigo-300 font-medium hover:text-white underline decoration-indigo-400/50"
        >
          Switch Friend
        </button>
      </div>

      {/* Footer Profile Bar */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-800/60 p-1.5 rounded-xl transition-colors flex-1 overflow-hidden group"
        >
          <div className="relative flex-shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                statusColorMap[currentUser.status]
              }`}
            />
          </div>

          <div className="overflow-hidden leading-tight flex-1">
            <p className="text-xs font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser.customStatus || `@${currentUser.id}`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          title="Profile & Preferences"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
