import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { MembersList } from './components/MembersList';
import { VoiceCallOverlay } from './components/VoiceCallOverlay';
import { ProfileModal } from './components/ProfileModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { AddFriendModal } from './components/AddFriendModal';
import { UserSwitcher } from './components/UserSwitcher';
import { ImageViewerModal } from './components/ImageViewerModal';
import { Channel, Message, User, ChannelType, VoiceParticipant } from './types';
import { sounds } from './lib/sound';
import { Users, Star, MessageSquare, Phone, UserPlus, Sparkles, Search } from 'lucide-react';

const INITIAL_USER: User = {
  id: 'user_kasun',
  name: 'Kasun Perera',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  status: 'online',
  customStatus: '🇱🇰 Having Tea & Chatting with friends',
  color: '#3B82F6',
  bio: 'Tech enthusiast from Colombo. Always up for tea or gaming!',
  joinedAt: '2026-01-15T08:30:00.000Z',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('talktribe_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('general-lounge');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [typingMap, setTypingMap] = useState<Record<string, string[]>>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Voice call state
  const [voiceRooms, setVoiceRooms] = useState<Record<string, VoiceParticipant[]>>({});
  const [isInVoiceCall, setIsInVoiceCall] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isVoiceMinimized, setIsVoiceMinimized] = useState<boolean>(false);

  // UI Drawer & Modal States
  const [showMembersDrawer, setShowMembersDrawer] = useState<boolean>(false);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'friends' | 'starred'>('channels');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState<boolean>(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState<boolean>(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState<boolean>(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Save current user to localStorage
  useEffect(() => {
    localStorage.setItem('talktribe_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Connect to WebSocket Server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Authenticate user with server
        ws.send(
          JSON.stringify({
            type: 'auth',
            user: currentUser,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'init': {
              setChannels(data.channels || []);
              setUsers(data.users || []);
              if (data.voiceCallRooms) setVoiceRooms(data.voiceCallRooms);
              break;
            }

            case 'new_message': {
              const newMsg: Message = data.message;
              setMessages((prev) => {
                const existing = prev[newMsg.channelId] || [];
                // Idempotency check
                if (existing.some((m) => m.id === newMsg.id)) return prev;
                return {
                  ...prev,
                  [newMsg.channelId]: [...existing, newMsg],
                };
              });

              // Play sound notification if from another user
              if (newMsg.senderId !== currentUser.id) {
                sounds.playReceive();
              } else {
                sounds.playSend();
              }
              break;
            }

            case 'message_reaction_updated': {
              const { channelId, messageId, reactions } = data;
              setMessages((prev) => {
                const channelMsgs = prev[channelId] || [];
                return {
                  ...prev,
                  [channelId]: channelMsgs.map((m) =>
                    m.id === messageId ? { ...m, reactions } : m
                  ),
                };
              });
              sounds.playPop();
              break;
            }

            case 'message_deleted': {
              const { channelId, messageId } = data;
              setMessages((prev) => ({
                ...prev,
                [channelId]: (prev[channelId] || []).filter((m) => m.id !== messageId),
              }));
              break;
            }

            case 'message_updated': {
              const msg: Message = data.message;
              setMessages((prev) => ({
                ...prev,
                [msg.channelId]: (prev[msg.channelId] || []).map((m) =>
                  m.id === msg.id ? msg : m
                ),
              }));
              break;
            }

            case 'channel_created': {
              setChannels((prev) => {
                if (prev.some((c) => c.id === data.channel.id)) return prev;
                return [...prev, data.channel];
              });
              break;
            }

            case 'typing_update': {
              const { channelId, userName, isTyping } = data;
              setTypingMap((prev) => {
                const currentTyping = prev[channelId] || [];
                if (isTyping) {
                  if (currentTyping.includes(userName)) return prev;
                  return { ...prev, [channelId]: [...currentTyping, userName] };
                } else {
                  return {
                    ...prev,
                    [channelId]: currentTyping.filter((u) => u !== userName),
                  };
                }
              });
              break;
            }

            case 'presence_change': {
              if (data.users) {
                setUsers(data.users);
              }
              break;
            }

            case 'voice_room_updated': {
              setVoiceRooms(data.voiceCallRooms || {});
              break;
            }

            default:
              break;
          }
        } catch (err) {
          console.error('Error processing WS event:', err);
        }
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [currentUser.id]);

  // Fetch initial channel message history on channel select
  useEffect(() => {
    if (!activeChannelId) return;

    fetch(`/api/messages/${activeChannelId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => ({
          ...prev,
          [activeChannelId]: data,
        }));
      })
      .catch(() => {});

    // Notify WS room change
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'join_channel',
          channelId: activeChannelId,
        })
      );
    }
  }, [activeChannelId]);

  // Polling for channels and active channel messages (fallback for serverless / Vercel deployment where WS is unavailable)
  useEffect(() => {
    const fetchLatestData = () => {
      // Fetch Channels
      fetch('/api/channels')
        .then((res) => res.json())
        .then((chList) => {
          if (Array.isArray(chList) && chList.length > 0) {
            setChannels(chList);
          }
        })
        .catch(() => {});

      // Fetch active channel messages
      if (activeChannelId) {
        fetch(`/api/messages/${activeChannelId}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setMessages((prev) => {
                const currentList = prev[activeChannelId] || [];
                // Check if length or content changed to avoid unnecessary re-renders
                if (
                  currentList.length !== data.length ||
                  JSON.stringify(currentList) !== JSON.stringify(data)
                ) {
                  return {
                    ...prev,
                    [activeChannelId]: data,
                  };
                }
                return prev;
              });
            }
          })
          .catch(() => {});
      }
    };

    fetchLatestData();
    const interval = setInterval(fetchLatestData, 2500);
    return () => clearInterval(interval);
  }, [activeChannelId]);

  // Send Message (WebSocket + HTTP Fallback for Vercel/Serverless)
  const handleSendMessage = (
    content: string,
    msgType: 'text' | 'image' | 'voice' | 'file' = 'text',
    mediaUrl?: string,
    voiceDuration?: number,
    fileName?: string,
    fileSize?: string
  ) => {
    const payload = {
      channelId: activeChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      msgType,
      mediaUrl,
      voiceDuration,
      fileName,
      fileSize,
      replyToId: replyingTo?.id,
      replyToSenderName: replyingTo?.senderName,
      replyToContent: replyingTo?.content || (replyingTo?.mediaUrl ? '[Media Attachment]' : ''),
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_message',
          ...payload,
        })
      );
    } else {
      // HTTP REST fallback for serverless / Vercel
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((newMsg: Message) => {
          setMessages((prev) => ({
            ...prev,
            [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
          }));
          sounds.playSend();
        })
        .catch((err) => console.error('Error sending msg via REST:', err));
    }

    setReplyingTo(null);
  };

  // Toggle Reaction
  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'toggle_reaction',
          channelId: activeChannelId,
          messageId,
          emoji,
          userId: currentUser.id,
        })
      );
    } else {
      fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChannelId,
          messageId,
          emoji,
          userId: currentUser.id,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.reactions) {
            setMessages((prev) => {
              const channelMsgs = prev[activeChannelId] || [];
              return {
                ...prev,
                [activeChannelId]: channelMsgs.map((m) =>
                  m.id === messageId ? { ...m, reactions: resData.reactions } : m
                ),
              };
            });
            sounds.playPop();
          }
        })
        .catch(() => {});
    }
  };

  // Delete Message
  const handleDeleteMessage = (messageId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'delete_message',
          channelId: activeChannelId,
          messageId,
        })
      );
    } else {
      fetch('/api/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: activeChannelId, messageId }),
      })
        .then(() => {
          setMessages((prev) => ({
            ...prev,
            [activeChannelId]: (prev[activeChannelId] || []).filter((m) => m.id !== messageId),
          }));
        })
        .catch(() => {});
    }
  };

  // Pin Message
  const handlePinMessage = (messageId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'pin_message',
          channelId: activeChannelId,
          messageId,
        })
      );
    } else {
      fetch('/api/messages/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: activeChannelId, messageId }),
      })
        .then((res) => res.json())
        .then((updatedMsg: Message) => {
          setMessages((prev) => ({
            ...prev,
            [activeChannelId]: (prev[activeChannelId] || []).map((m) =>
              m.id === messageId ? updatedMsg : m
            ),
          }));
        })
        .catch(() => {});
    }
  };

  // Star Message
  const handleStarMessage = (messageId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'star_message',
          channelId: activeChannelId,
          messageId,
        })
      );
    } else {
      fetch('/api/messages/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: activeChannelId, messageId }),
      })
        .then((res) => res.json())
        .then((updatedMsg: Message) => {
          setMessages((prev) => ({
            ...prev,
            [activeChannelId]: (prev[activeChannelId] || []).map((m) =>
              m.id === messageId ? updatedMsg : m
            ),
          }));
        })
        .catch(() => {});
    }
  };

  // Send Typing Status
  const handleTypingStatus = (isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'typing_status',
        channelId: activeChannelId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping,
      })
    );
  };

  // Create Channel
  const handleCreateChannel = (
    name: string,
    description: string,
    icon: string,
    type: ChannelType
  ) => {
    fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        icon,
        type,
        createdBy: currentUser.id,
        members: users.map((u) => u.id),
      }),
    })
      .then((res) => res.json())
      .then((newChan) => {
        setChannels((prev) => [...prev, newChan]);
        setActiveChannelId(newChan.id);
      });
  };

  // Start Direct Message with User
  const handleStartDirectMessage = (targetUser: User) => {
    const existingDm = channels.find(
      (c) => c.type === 'direct' && c.members.includes(targetUser.id) && c.members.includes(currentUser.id)
    );

    if (existingDm) {
      setActiveChannelId(existingDm.id);
      setActiveTab('channels');
    } else {
      // Create new DM channel
      fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: targetUser.name,
          type: 'direct',
          description: `Direct chat with ${targetUser.name}`,
          icon: '👤',
          createdBy: currentUser.id,
          members: [currentUser.id, targetUser.id],
        }),
      })
        .then((res) => res.json())
        .then((newDm) => {
          setChannels((prev) => [...prev, newDm]);
          setActiveChannelId(newDm.id);
          setActiveTab('channels');
        });
    }
  };

  // Join Voice Call
  const handleJoinVoiceCall = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setIsInVoiceCall(true);
    setIsVoiceMinimized(false);
    sounds.playCallJoin();

    wsRef.current.send(
      JSON.stringify({
        type: 'voice_join',
        channelId: activeChannelId,
        user: currentUser,
        isMuted: isVoiceMuted,
      })
    );
  };

  // Leave Voice Call
  const handleLeaveVoiceCall = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setIsInVoiceCall(false);
    sounds.playCallLeave();

    wsRef.current.send(
      JSON.stringify({
        type: 'voice_leave',
        channelId: activeChannelId,
        userId: currentUser.id,
      })
    );
  };

  // Toggle Mute
  const handleToggleVoiceMute = () => {
    const nextMute = !isVoiceMuted;
    setIsVoiceMuted(nextMute);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'voice_toggle_state',
          channelId: activeChannelId,
          userId: currentUser.id,
          isMuted: nextMute,
        })
      );
    }
  };

  // Save Profile
  const handleSaveProfile = (updated: Partial<User>) => {
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);

    fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile),
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'presence_update',
          userId: newProfile.id,
          status: newProfile.status,
          customStatus: newProfile.customStatus,
        })
      );
    }
  };

  // Switch User Profile (Simulator)
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'auth',
          user,
        })
      );
    }
  };

  // Create Custom User
  const handleCreateCustomUser = (name: string, customStatus: string) => {
    const newFriend: User = {
      id: `user_${Date.now()}`,
      name,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=150&q=80`,
      status: 'online',
      customStatus,
      joinedAt: new Date().toISOString(),
    };

    fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFriend),
    }).then(() => {
      setUsers((prev) => [...prev, newFriend]);
      setCurrentUser(newFriend);
    });
  };

  // Active channel details
  const activeChannel = channels.find((c) => c.id === activeChannelId) || {
    id: 'general-lounge',
    name: 'general-lounge',
    type: 'public_group' as ChannelType,
    description: 'Main Lounge',
    icon: '💬',
    createdBy: 'system',
    members: users.map((u) => u.id),
  };

  const currentMessages = messages[activeChannelId] || [];
  const pinnedMessages = currentMessages.filter((m) => m.isPinned);
  const starredMessagesAll = Object.values(messages).flat().filter((m) => m.isStarred);

  const activeVoiceRoomParticipants = voiceRooms[activeChannelId] || [];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden antialiased">
      {/* Left Sidebar */}
      <Sidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        currentUser={currentUser}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenCreateChannel={() => setShowCreateChannelModal(true)}
        onOpenAddFriend={() => setShowAddFriendModal(true)}
        onOpenUserSwitcher={() => setShowUserSwitcher(true)}
        activeVoiceRoom={
          isInVoiceCall
            ? {
                channelId: activeChannelId,
                channelName: activeChannel.name,
                participants: activeVoiceRoomParticipants,
              }
            : undefined
        }
        onLeaveVoice={handleLeaveVoiceCall}
        onToggleMuteVoice={handleToggleVoiceMute}
        isVoiceMuted={isVoiceMuted}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        starredCount={starredMessagesAll.length}
      />

      {/* Center Chat View / Friends View / Starred Messages View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
        {activeTab === 'channels' && (
          <>
            <ChatHeader
              channel={activeChannel}
              memberCount={activeChannel.members.length}
              onlineCount={users.filter((u) => u.status === 'online').length}
              onOpenMembers={() => setShowMembersDrawer((prev) => !prev)}
              onTogglePins={() => setShowPinnedDrawer((prev) => !prev)}
              showPins={showPinnedDrawer}
              onStartVoiceCall={isInVoiceCall ? handleLeaveVoiceCall : handleJoinVoiceCall}
              isInVoiceCall={isInVoiceCall}
              onOpenAddFriend={() => setShowAddFriendModal(true)}
              onSearchClick={() => setShowPinnedDrawer(true)}
            />

            <div className="flex-1 flex h-full overflow-hidden">
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <MessageList
                  messages={currentMessages}
                  currentUser={currentUser}
                  onToggleReaction={handleToggleReaction}
                  onReplyToMessage={(msg) => setReplyingTo(msg)}
                  onPinMessage={handlePinMessage}
                  onStarMessage={handleStarMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onImageClick={(url) => setExpandedImage(url)}
                  pinnedMessages={pinnedMessages}
                  onUnpin={handlePinMessage}
                  showPinnedDrawer={showPinnedDrawer}
                />

                <ChatInput
                  onSendMessage={handleSendMessage}
                  onTypingStatus={handleTypingStatus}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  typingUsers={typingMap[activeChannelId] || []}
                />
              </div>

              {/* Right Members Drawer */}
              {showMembersDrawer && (
                <MembersList
                  users={users}
                  channelMembers={activeChannel.members}
                  currentUser={currentUser}
                  onClose={() => setShowMembersDrawer(false)}
                  onStartDirectMessage={handleStartDirectMessage}
                  onOpenAddFriend={() => setShowAddFriendModal(true)}
                />
              )}
            </div>
          </>
        )}

        {/* FRIENDS LIST TAB */}
        {activeTab === 'friends' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Friends List
                </h2>
                <p className="text-xs text-slate-400">
                  All connected friends on TalkTribe ({users.length})
                </p>
              </div>

              <button
                onClick={() => setShowAddFriendModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <UserPlus className="w-4 h-4" /> Invite More Friends
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          u.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-bold text-sm text-slate-100 truncate">{u.name}</h3>
                      <p className="text-xs text-slate-400 truncate">
                        {u.customStatus || u.bio || `@${u.id}`}
                      </p>
                    </div>
                  </div>

                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => handleStartDirectMessage(u)}
                      className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STARRED MESSAGES TAB */}
        {activeTab === 'starred' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Starred Favorites
              </h2>
              <p className="text-xs text-slate-400">
                Your saved favorite messages ({starredMessagesAll.length})
              </p>
            </div>

            <div className="space-y-3">
              {starredMessagesAll.map((msg) => (
                <div key={msg.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3">
                  <img src={msg.senderAvatar} alt={msg.senderName} className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-indigo-300">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-200">{msg.content}</p>
                    {msg.mediaUrl && <img src={msg.mediaUrl} alt="Starred Media" className="mt-2 max-h-40 rounded-xl object-cover" />}
                  </div>
                </div>
              ))}
              {starredMessagesAll.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No starred messages yet. Hover any message and click the Star icon to save it here!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voice / Video Call Fullscreen Overlay */}
      {isInVoiceCall && !isVoiceMinimized && (
        <VoiceCallOverlay
          channelName={activeChannel.name}
          participants={activeVoiceRoomParticipants}
          currentUser={currentUser}
          onLeaveCall={handleLeaveVoiceCall}
          onToggleMute={handleToggleVoiceMute}
          isMuted={isVoiceMuted}
          onMinimize={() => setIsVoiceMinimized(true)}
        />
      )}

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          currentUser={currentUser}
          onSaveProfile={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
          soundEnabled={sounds.isEnabled()}
          onToggleSound={(enabled) => {
            sounds.setSoundEnabled(enabled);
            setSoundEnabled(enabled);
          }}
        />
      )}

      {showCreateChannelModal && (
        <CreateChannelModal
          onCreateChannel={handleCreateChannel}
          onClose={() => setShowCreateChannelModal(false)}
        />
      )}

      {showAddFriendModal && (
        <AddFriendModal
          onClose={() => setShowAddFriendModal(false)}
          onOpenUserSwitcher={() => setShowUserSwitcher(true)}
        />
      )}

      {showUserSwitcher && (
        <UserSwitcher
          users={users}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onCreateCustomUser={handleCreateCustomUser}
          onClose={() => setShowUserSwitcher(false)}
        />
      )}

      {expandedImage && (
        <ImageViewerModal
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}
