import React from 'react';
import { 
  Phone, 
  Video, 
  Users, 
  Pin, 
  Search, 
  MoreVertical,
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
    <div className="h-16 px-4 bg-whatsapp-panel border-b border-slate-800/60 flex items-center justify-between select-none z-10 flex-shrink-0">
      {/* Left Contact / Channel Info */}
      <div 
        onClick={onOpenMembers}
        className="flex items-center gap-3 cursor-pointer group overflow-hidden"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 overflow-hidden">
          {channel.type === 'direct' ? (
            channel.name.substring(0, 2).toUpperCase()
          ) : (
            <span>{channel.icon || '💬'}</span>
          )}
        </div>

        <div className="overflow-hidden leading-tight">
          <h2 className="font-bold text-slate-100 text-base tracking-wide truncate group-hover:text-emerald-400 transition-colors">
            {channel.name}
          </h2>
          <p className="text-[11px] text-emerald-400 font-medium truncate">
            {channel.type === 'direct' ? 'online • click for info' : `${memberCount} members • ${onlineCount} online`}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-300">
        {/* Voice Call Button */}
        <button
          onClick={onStartVoiceCall}
          className={`p-2.5 rounded-full transition-all ${
            isInVoiceCall
              ? 'bg-emerald-600 text-white animate-pulse'
              : 'hover:bg-slate-700/60 text-slate-300 hover:text-white'
          }`}
          title="WhatsApp Voice Call"
        >
          {isInVoiceCall ? <Volume2 className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5" />}
        </button>

        {/* Video Call Mock Button */}
        <button
          onClick={onStartVoiceCall}
          className="p-2.5 rounded-full hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          title="WhatsApp Video Call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Search */}
        <button
          onClick={onSearchClick}
          className="p-2.5 rounded-full hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          title="Search in chat"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Pinned Messages */}
        <button
          onClick={onTogglePins}
          className={`p-2.5 rounded-full transition-colors ${
            showPins
              ? 'bg-amber-500/20 text-amber-400'
              : 'hover:bg-slate-700/60 text-slate-300 hover:text-white'
          }`}
          title="Pinned Messages"
        >
          <Pin className="w-5 h-5" />
        </button>

        {/* Members Drawer Toggle */}
        <button
          onClick={onOpenMembers}
          className="p-2.5 rounded-full hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          title="Chat info & members"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

