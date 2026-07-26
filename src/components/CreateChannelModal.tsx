import React, { useState } from 'react';
import { X, Hash, Lock, Globe, Plus, Sparkles } from 'lucide-react';
import { ChannelType } from '../types';

interface CreateChannelModalProps {
  onCreateChannel: (name: string, description: string, icon: string, type: ChannelType) => void;
  onClose: () => void;
}

const CHANNEL_ICONS = ['💬', '🇱🇰', '🎮', '🎵', '☕', '🚀', '📸', '📚', '🔥', '🎉'];

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  onCreateChannel,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [type, setType] = useState<ChannelType>('public_group');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateChannel(name.trim(), description.trim(), icon, type);
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
          <Plus className="w-5 h-5 text-indigo-400" />
          Create New Chat Room
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Set up a topic channel for your group of friends.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Room Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. weekend-trips"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Room Icon
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {CHANNEL_ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`text-xl p-2 rounded-xl transition-all ${
                    icon === i ? 'bg-indigo-600/30 border border-indigo-500 scale-110' : 'bg-slate-950 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Description / Topic
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
            />
          </div>

          {/* Privacy Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Privacy Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('public_group')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  type === 'public_group'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Public Room</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Anyone in your group can join and chat.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('private_group')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  type === 'private_group'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Private Room</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Only invited friends can view and message.
                </p>
              </button>
            </div>
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
