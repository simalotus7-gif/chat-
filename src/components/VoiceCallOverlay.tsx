import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Minimize2, 
  Maximize2, 
  Volume2, 
  Users, 
  Sparkles,
  Radio
} from 'lucide-react';
import { User, VoiceParticipant } from '../types';

interface VoiceCallOverlayProps {
  channelName: string;
  participants: VoiceParticipant[];
  currentUser: User;
  onLeaveCall: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onMinimize: () => void;
}

export const VoiceCallOverlay: React.FC<VoiceCallOverlayProps> = ({
  channelName,
  participants,
  currentUser,
  onLeaveCall,
  onToggleMute,
  isMuted,
  onMinimize,
}) => {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (isVideoOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsVideoOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoOn(true);
      } catch (err) {
        alert('Camera permission denied or camera not available.');
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 select-none animate-fade-in">
      {/* Call Header */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              #{channelName} — Voice Room
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Duration: {formatDuration(durationSeconds)} • {participants.length} Active Participants
            </p>
          </div>
        </div>

        <button
          onClick={onMinimize}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Minimize Call to Floating Dock"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Participants Grid */}
      <div className="flex-1 my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center justify-center overflow-y-auto custom-scrollbar">
        {participants.map((p) => {
          const isMe = p.user.id === currentUser.id;

          return (
            <div
              key={p.user.id}
              className={`relative bg-slate-900 border rounded-3xl p-6 flex flex-col items-center justify-center aspect-video shadow-2xl transition-all ${
                p.isSpeaking || isMe
                  ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                  : 'border-slate-800'
              }`}
            >
              {/* If camera is on for local user */}
              {isMe && isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                />
              ) : (
                /* Avatar with Pulse Animation */
                <div className="relative">
                  <img
                    src={p.user.avatar}
                    alt={p.user.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-800 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                    {p.isMuted ? (
                      <MicOff className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Mic className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              )}

              {/* Name Overlay Banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-100 truncate">
                  {p.user.name} {isMe ? '(You)' : ''}
                </span>
                <div className="flex items-center gap-1.5">
                  {!p.isMuted && (
                    <div className="flex items-center gap-0.5">
                      {[40, 80, 50, 90].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call Controls Bar */}
      <div className="flex items-center justify-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl max-w-md mx-auto">
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all shadow-md ${
            isMuted ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title={isMuted ? 'Unmute' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all shadow-md ${
            isVideoOn ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={() => setIsScreenSharing((prev) => !prev)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all shadow-md ${
            isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Leave Call (Red) */}
        <button
          onClick={onLeaveCall}
          className="w-12 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          title="Disconnect Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
