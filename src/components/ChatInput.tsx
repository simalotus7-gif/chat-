import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square, 
  Smile, 
  X, 
  Image as ImageIcon, 
  Bold, 
  Code, 
  Sparkles,
  Check,
  Volume2
} from 'lucide-react';
import { Message, User } from '../types';

interface ChatInputProps {
  onSendMessage: (
    content: string, 
    type?: 'text' | 'image' | 'voice' | 'file',
    mediaUrl?: string,
    voiceDuration?: number,
    fileName?: string,
    fileSize?: string
  ) => void;
  onTypingStatus: (isTyping: boolean) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  typingUsers: string[];
}

const EMOJI_CATEGORIES = [
  {
    name: '🇱🇰 Sri Lanka & Vibes',
    emojis: ['🇱🇰', '🍲', '🍵', '🏏', '🐘', '🌴', '🏖️', '⛰️', '🔥', '✨']
  },
  {
    name: 'Popular & Reactions',
    emojis: ['👍', '❤️', '😂', '😍', '👏', '🎉', '😮', '🙌', '💯', '🙏']
  },
  {
    name: 'Activities & Fun',
    emojis: ['🎮', '🎵', '💻', '📷', '🎧', '⚽', '🚗', '✈️', '🍕', '🍻']
  }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTypingStatus,
  replyingTo,
  onCancelReply,
  typingUsers,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    url: string;
    name: string;
    size: string;
    type: 'image' | 'file';
  } | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing event throttle
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStatus(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (attachedFile) {
      onSendMessage(
        text.trim(),
        attachedFile.type,
        attachedFile.url,
        undefined,
        attachedFile.name,
        attachedFile.size
      );
      setAttachedFile(null);
      setText('');
      setShowEmojiPicker(false);
      onTypingStatus(false);
      return;
    }

    if (!text.trim()) return;

    onSendMessage(text.trim(), 'text');
    setText('');
    setShowEmojiPicker(false);
    onTypingStatus(false);
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage('', 'voice', base64Audio, recordingTime);
        };
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission is required to record voice notes.');
    }
  };

  // Stop & Save Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Cancel Recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Do not emit onstop callback
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Handle File / Image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setAttachedFile({
        url: result,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: isImage ? 'image' : 'file',
      });
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const insertFormat = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    setText(text.substring(0, start) + replacement + text.substring(end));
  };

  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800 relative z-10 flex-shrink-0">
      {/* Typing Indicator Bar */}
      {typingUsers.length > 0 && (
        <div className="absolute -top-7 left-4 text-[11px] text-indigo-400 font-medium flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-0.5 rounded-t-lg border-t border-x border-slate-800 backdrop-blur-sm animate-pulse">
          <Sparkles className="w-3 h-3 text-indigo-300" />
          <span>{typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...</span>
        </div>
      )}

      {/* Reply Quote Banner */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs">
          <div className="overflow-hidden pr-2">
            <span className="font-bold text-indigo-300">Replying to {replyingTo.senderName}: </span>
            <span className="text-slate-300 truncate">{replyingTo.content || '[Media]'}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Preview Card */}
      {attachedFile && (
        <div className="mb-2 flex items-center justify-between bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs max-w-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            {attachedFile.type === 'image' ? (
              <img src={attachedFile.url} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                FILE
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-bold text-slate-200 truncate">{attachedFile.name}</p>
              <p className="text-[10px] text-slate-400">{attachedFile.size}</p>
            </div>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 text-slate-400 hover:text-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-30 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-indigo-400" /> Choose Emoji
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {cat.name}
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {cat.emojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => insertEmoji(e)}
                      className="text-xl p-1.5 hover:bg-slate-800 rounded-lg transition-transform active:scale-125 flex items-center justify-center"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Mode UI */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-2xl animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-rose-300">
              Recording Voice Note: {recordingTime}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Send Voice
            </button>
          </div>
        </div>
      ) : (
        /* Normal Input Bar */
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500/60 transition-colors shadow-inner">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none px-2 py-1 max-h-24 custom-scrollbar"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1 px-1">
            {/* Formatting & Upload Tools */}
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Attach Photo or Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormat('**', '**')}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors font-bold text-xs"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => insertFormat('`', '`')}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showEmojiPicker ? 'text-indigo-400 bg-slate-800' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                }`}
                title="Emoji Picker"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            {/* Voice Record & Send Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={startRecording}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Record Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() && !attachedFile}
                className={`p-2 rounded-xl transition-all shadow-md flex items-center justify-center ${
                  text.trim() || attachedFile
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
