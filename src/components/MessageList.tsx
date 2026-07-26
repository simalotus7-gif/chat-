import React, { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  Reply, 
  Star, 
  Pin, 
  Trash2, 
  Copy, 
  Play, 
  Pause, 
  FileText, 
  Download, 
  Check, 
  CheckCheck,
  MoreHorizontal,
  Volume2
} from 'lucide-react';
import { Message, User } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onReplyToMessage: (msg: Message) => void;
  onPinMessage: (messageId: string) => void;
  onStarMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onImageClick: (url: string) => void;
  pinnedMessages: Message[];
  onUnpin: (messageId: string) => void;
  showPinnedDrawer: boolean;
}

const POPULAR_EMOJIS = ['👍', '❤️', '😂', '🔥', '🇱🇰', '🎉', '😍', '👏'];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  onToggleReaction,
  onReplyToMessage,
  onPinMessage,
  onStarMessage,
  onDeleteMessage,
  onImageClick,
  pinnedMessages,
  onUnpin,
  showPinnedDrawer,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoicePlay = (msgId: string) => {
    const audio = audioRefs.current[msgId];
    if (!audio) return;

    if (playingVoiceId === msgId) {
      audio.pause();
      setPlayingVoiceId(null);
    } else {
      // Pause any currently playing audio
      if (playingVoiceId && audioRefs.current[playingVoiceId]) {
        audioRefs.current[playingVoiceId]?.pause();
      }
      audio.play().then(() => setPlayingVoiceId(msgId)).catch(() => {});
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    // Process simple code blocks, links, and bolding
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g);

    return (
      <span className="whitespace-pre-wrap break-words leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={i} className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px] border border-slate-800">
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith('http://') || part.startsWith('https://')) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline font-medium break-all"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 whatsapp-wallpaper custom-scrollbar relative">
      {/* Pinned Messages Header Banner */}
      {showPinnedDrawer && pinnedMessages.length > 0 && (
        <div className="sticky top-0 z-20 bg-whatsapp-panel border border-amber-500/30 rounded-xl p-3 backdrop-blur-md shadow-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Pin className="w-3.5 h-3.5" />
              <span>Pinned Messages ({pinnedMessages.length})</span>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {pinnedMessages.map((p) => (
              <div key={p.id} className="flex items-start justify-between bg-whatsapp-dark p-2 rounded-lg border border-slate-800 text-xs">
                <div className="overflow-hidden">
                  <span className="font-bold text-emerald-400">{p.senderName}: </span>
                  <span className="text-slate-200">{p.content || '[Media]'}</span>
                </div>
                <button
                  onClick={() => onUnpin(p.id)}
                  className="text-slate-500 hover:text-amber-400 ml-2"
                  title="Unpin"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl mb-3 border border-emerald-500/20 shadow-xl">
            🔒
          </div>
          <h3 className="font-bold text-slate-100 text-base mb-1">WhatsApp Encrypted Chat</h3>
          <p className="text-xs max-w-sm text-slate-400 leading-relaxed">
            Messages are end-to-end encrypted. Send voice notes, photos, or text to start messaging in real-time!
          </p>
        </div>
      )}

      {/* Message List */}
      {messages.map((msg, index) => {
        const isMe = msg.senderId === currentUser.id;
        const prevMsg = messages[index - 1];
        const isSameSender = prevMsg && prevMsg.senderId === msg.senderId && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60 * 1000);

        return (
          <div
            key={msg.id}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
            className={`group relative flex ${isMe ? 'justify-end' : 'justify-start'} ${
              isSameSender ? 'mt-1' : 'mt-3'
            }`}
          >
            {/* WhatsApp Speech Bubble */}
            <div className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-md transition-all ${
              isMe 
                ? 'bg-whatsapp-out text-slate-100 rounded-tr-xs' 
                : 'bg-whatsapp-in text-slate-100 rounded-tl-xs border border-slate-700/40'
            }`}>
              {/* Incoming Sender Name */}
              {!isMe && !isSameSender && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-emerald-400 hover:underline cursor-pointer">
                    {msg.senderName}
                  </span>
                  {msg.isPinned && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1 py-0.2 rounded">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                  {msg.isStarred && (
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                </div>
              )}

              {/* Reply Quote preview */}
              {msg.replyToId && (
                <div className={`mb-1.5 pl-2.5 border-l-3 py-1 px-2 rounded-r-md text-xs ${
                  isMe ? 'border-emerald-300 bg-emerald-950/40' : 'border-teal-400 bg-slate-900/60'
                }`}>
                  <p className="font-bold text-emerald-300 text-[11px]">
                    Replying to {msg.replyToSenderName}:
                  </p>
                  <p className="text-slate-300 truncate text-[11px]">
                    {msg.replyToContent}
                  </p>
                </div>
              )}

              {/* Text Message Content */}
              {msg.content && (
                <div className="text-xs text-slate-100 leading-relaxed inline">
                  {renderFormattedText(msg.content)}
                </div>
              )}

              {/* Attached Image */}
              {msg.type === 'image' && msg.mediaUrl && (
                <div className="mt-1.5 max-w-sm rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 shadow-md group/img relative cursor-pointer">
                  <img
                    src={msg.mediaUrl}
                    alt="Shared media"
                    onClick={() => onImageClick(msg.mediaUrl!)}
                    className="w-full h-auto max-h-72 object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                  />
                </div>
              )}

              {/* Audio Voice Note Player (WhatsApp Style) */}
              {msg.type === 'voice' && msg.mediaUrl && (
                <div className="mt-1 flex items-center gap-3 py-1 px-1 rounded-xl">
                  <button
                    onClick={() => toggleVoicePlay(msg.id)}
                    className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                  >
                    {playingVoiceId === msg.id ? (
                      <Pause className="w-5 h-5 fill-slate-950" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5 fill-slate-950" />
                    )}
                  </button>

                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-1 h-6 my-1">
                      {[40, 70, 30, 90, 60, 100, 45, 80, 50, 85, 35, 75, 60, 40, 90, 30].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1 rounded-full transition-all ${
                            playingVoiceId === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        Voice Note
                      </span>
                      <span>{msg.voiceDuration ? `${msg.voiceDuration}s` : '0:05'}</span>
                    </div>
                  </div>

                  <audio
                    ref={(el) => (audioRefs.current[msg.id] = el)}
                    src={msg.mediaUrl}
                    onEnded={() => setPlayingVoiceId(null)}
                    className="hidden"
                  />
                </div>
              )}

              {/* File Download Card */}
              {msg.type === 'file' && (
                <div className="mt-1 flex items-center gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-100 truncate">{msg.fileName || 'Document'}</p>
                    <p className="text-[10px] text-slate-400">{msg.fileSize || 'Attachment'}</p>
                  </div>
                  {msg.mediaUrl && (
                    <a
                      href={msg.mediaUrl}
                      download={msg.fileName || 'file'}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Message Reactions Badges */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {msg.reactions.map((r) => {
                    const hasMyReaction = r.users.includes(currentUser.id);
                    return (
                      <button
                        key={r.emoji}
                        onClick={() => onToggleReaction(msg.id, r.emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                          hasMyReaction
                            ? 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 shadow-sm'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Timestamp & Read Receipt Double Blue Checkmarks */}
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                <span>{formatTimestamp(msg.timestamp)}</span>
                {isMe && (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" title="Read" />
                )}
              </div>

              {/* Hover Action Floating Bar */}
              {hoveredMessageId === msg.id && (
                <div className={`absolute ${isMe ? 'left-2' : 'right-2'} -top-4 z-10 flex items-center gap-0.5 bg-whatsapp-panel border border-slate-700 rounded-full p-1 shadow-2xl backdrop-blur-md animate-fade-in`}>
                  {POPULAR_EMOJIS.slice(0, 4).map((e) => (
                    <button
                      key={e}
                      onClick={() => onToggleReaction(msg.id, e)}
                      className="p-1 hover:bg-slate-700 rounded-full text-xs transition-transform active:scale-125"
                      title={`React with ${e}`}
                    >
                      {e}
                    </button>
                  ))}

                  <div className="w-px h-4 bg-slate-700 mx-0.5" />

                  <button
                    onClick={() => onReplyToMessage(msg)}
                    className="p-1 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-full transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onPinMessage(msg.id)}
                    className={`p-1 hover:bg-slate-700 rounded-full transition-colors ${
                      msg.isPinned ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'
                    }`}
                    title={msg.isPinned ? 'Unpin' : 'Pin Message'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onStarMessage(msg.id)}
                    className={`p-1 hover:bg-slate-700 rounded-full transition-colors ${
                      msg.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'
                    }`}
                    title="Star Message"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  {msg.content && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
                      title="Copy Text"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {isMe && (
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-full transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

