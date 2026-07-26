import React from 'react';
import { 
  Hash, 
  Phone, 
  Video, 
  Users, 
  Pin, 
  Search, 
  UserPlus, 
  Share2, 
  Globe, 
  Lock,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Channel } from '../types';

interface ChatHeaderProps {
  channel: Channel;
  memberCount: number;
  onlineCount: number;
  onOpenMembers: () => void;
  onTogglePins: () => void;
  showPins: boolean;
  onStartVoiceCall: () => void;
  isInVoiceCall: boolean;
  onOpenAddFriend: () => void;
  onSearchClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  channel,
  memberCount,
  onlineCount,
  onOpenMembers,
  onTogglePins,
  showPins,
  onStartVoiceCall,
  isInVoiceCall,
  onOpenAddFriend,
  onSearchClick,
}) => {
  return (
    <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-sm select-none z-10 flex-shrink-0">
      {/* Left Channel Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">{channel.icon || '#'}</span>
          <h2 className="font-bold text-slate-100 text-base tracking-wide truncate">
            {channel.name}
          </h2>
        </div>

        {channel.description && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pl-3 border-l border-slate-800 truncate max-w-md">
            <span className="truncate">{channel.description}</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Voice Call Button */}
        <button
          onClick={onStartVoiceCall}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            isInVoiceCall
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
              : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
          }`}
          title="Join Voice / Video Room"
        >
          {isInVoiceCall ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-white" />
              <span>In Voice</span>
            </>
          ) : (
            <>
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Voice Call</span>
            </>
          )}
        </button>

        {/* Invite Link Button */}
        <button
          onClick={onOpenAddFriend}
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Share Invite Code / Room Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Search */}
        <button
          onClick={onSearchClick}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          title="Search Messages"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Pinned Messages */}
        <button
          onClick={onTogglePins}
          className={`p-2 rounded-lg transition-colors ${
            showPins
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
          title="Pinned Messages"
        >
          <Pin className="w-4 h-4" />
        </button>

        {/* Members Drawer Toggle */}
        <button
          onClick={onOpenMembers}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors border border-slate-700/50"
          title="Show Channel Members"
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {onlineCount}/{memberCount}
          </span>
        </button>
      </div>
    </div>
  );
};
