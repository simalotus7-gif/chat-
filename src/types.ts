export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  customStatus?: string;
  color?: string;
  bio?: string;
  joinedAt: string;
}

export type ChannelType = 'public_group' | 'private_group' | 'direct';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  icon?: string;
  createdBy: string;
  members: string[]; // User IDs
  category?: string;
  isPinned?: boolean;
  unreadCount?: number;
  lastMessageAt?: string;
}

export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'system';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // User IDs who reacted
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: MessageType;
  mediaUrl?: string;
  voiceDuration?: number; // seconds
  fileName?: string;
  fileSize?: string;
  reactions: MessageReaction[];
  replyToId?: string;
  replyToSenderName?: string;
  replyToContent?: string;
  isPinned?: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  channelId: string;
}

export interface VoiceParticipant {
  user: User;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isVideoOn: boolean;
}

export interface VoiceCallRoom {
  channelId: string;
  channelName: string;
  participants: VoiceParticipant[];
}
