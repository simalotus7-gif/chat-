import express from "express";

const app = express();

app.use(express.json({ limit: "25mb" }));

// Types
interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "idle" | "dnd" | "offline";
  customStatus?: string;
  color?: string;
  bio?: string;
  joinedAt: string;
}

interface Channel {
  id: string;
  name: string;
  type: "public_group" | "private_group" | "direct";
  description?: string;
  icon?: string;
  createdBy: string;
  members: string[];
  category?: string;
  isPinned?: boolean;
  lastMessageAt?: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "voice" | "file";
  mediaUrl?: string;
  voiceDuration?: number;
  fileName?: string;
  fileSize?: string;
  reactions: Reaction[];
  replyToId?: string;
  replyToSenderName?: string;
  replyToContent?: string;
  isPinned?: boolean;
  isStarred?: boolean;
}

// In-Memory Data Store for Vercel Instance
const DEFAULT_USERS: User[] = [
  {
    id: "user_kasun",
    name: "Kasun Perera",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    status: "online",
    customStatus: "🇱🇰 Having Tea & Chatting",
    color: "#3B82F6",
    bio: "Tech enthusiast from Colombo. Welcome to TalkTribe!",
    joinedAt: "2026-01-15T08:30:00.000Z",
  },
];

let channels: Channel[] = [
  {
    id: "general-lounge",
    name: "general-lounge",
    type: "public_group",
    description: "Main lounge for catching up with friends!",
    icon: "💬",
    createdBy: "system",
    members: ["user_kasun"],
    category: "TEXT CHANNELS",
    isPinned: true,
  },
  {
    id: "sri-lanka-vibes",
    name: "sri-lanka-vibes",
    type: "public_group",
    description: "🇱🇰 Share local updates, trip plans, food spots & fun memes",
    icon: "🇱🇰",
    createdBy: "system",
    members: ["user_kasun"],
    category: "TEXT CHANNELS",
  },
  {
    id: "gaming-squad",
    name: "gaming-squad",
    type: "public_group",
    description: "🎮 Coordination room for evening game sessions",
    icon: "🎮",
    createdBy: "system",
    members: ["user_kasun"],
    category: "GAMING & FUN",
  },
  {
    id: "music-and-chill",
    name: "music-and-chill",
    type: "public_group",
    description: "🎵 Post songs, voice audio notes, and playlists",
    icon: "🎵",
    createdBy: "system",
    members: ["user_kasun"],
    category: "GAMING & FUN",
  },
];

let messages: Record<string, Message[]> = {
  "general-lounge": [
    {
      id: "msg_1",
      channelId: "general-lounge",
      senderId: "user_kasun",
      senderName: "Kasun Perera",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      content: "Machan, kohomada? Machanla, end of week party ekak daamuda?",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      type: "text",
      reactions: [
        { emoji: "🔥", count: 3, users: ["user_dilshan", "user_nimali", "user_amal"] },
        { emoji: "👍", count: 2, users: ["user_dilshan", "user_amal"] },
      ],
      isPinned: true,
    },
    {
      id: "msg_2",
      channelId: "general-lounge",
      senderId: "user_dilshan",
      senderName: "Dilshan Silva",
      senderAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      content: "Ela machan! Ela idea ekak. Mirissa or Ella trip ekak yaman Sunday!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: "text",
      reactions: [{ emoji: "❤️", count: 2, users: ["user_nimali", "user_kasun"] }],
    },
    {
      id: "msg_3",
      channelId: "general-lounge",
      senderId: "user_nimali",
      senderName: "Nimali Fernando",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      content: "Ella subha view ekak tieyenne me dawaswala! Here's a photo I took last month 📸",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
      reactions: [{ emoji: "😍", count: 3, users: ["user_kasun", "user_dilshan", "user_amal"] }],
    },
  ],
  "sri-lanka-vibes": [
    {
      id: "msg_sl_1",
      channelId: "sri-lanka-vibes",
      senderId: "user_kasun",
      senderName: "Kasun Perera",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      content: "Subha Dhavasak yaluwane! 🇱🇰 Welcome to our friendship chat room!",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: "text",
      reactions: [{ emoji: "🇱🇰", count: 4, users: ["user_kasun", "user_dilshan", "user_nimali", "user_amal"] }],
    },
  ],
};

let activeUsersMap: Map<string, User> = new Map();
DEFAULT_USERS.forEach((u) => activeUsersMap.set(u.id, u));

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/channels", (_req, res) => {
  res.json(channels);
});

app.post("/api/channels", (req, res) => {
  const { name, description, icon, type, createdBy, members } = req.body;
  if (!name) {
    res.status(400).json({ error: "Channel name is required" });
    return;
  }
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");
  const newChannel: Channel = {
    id: `channel_${Date.now()}`,
    name: cleanName,
    type: type || "public_group",
    description: description || "",
    icon: icon || "#",
    createdBy: createdBy || "user_kasun",
    members: members || ["user_kasun", "user_dilshan", "user_nimali", "user_amal"],
    category: type === "direct" ? "DIRECT MESSAGES" : "GROUP CHANNELS",
  };
  channels.push(newChannel);
  if (!messages[newChannel.id]) {
    messages[newChannel.id] = [];
  }
  res.status(201).json(newChannel);
});

app.get("/api/messages/:channelId", (req, res) => {
  const { channelId } = req.params;
  res.json(messages[channelId] || []);
});

app.post("/api/messages", (req, res) => {
  const { channelId, senderId, senderName, senderAvatar, content, msgType, mediaUrl, voiceDuration, fileName, fileSize, replyToId, replyToSenderName, replyToContent } = req.body;
  
  if (!channelId || !senderId) {
    res.status(400).json({ error: "channelId and senderId required" });
    return;
  }

  if (!messages[channelId]) {
    messages[channelId] = [];
  }

  const newMsg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    channelId,
    senderId,
    senderName: senderName || "Friend",
    senderAvatar: senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    content: content || "",
    timestamp: new Date().toISOString(),
    type: msgType || "text",
    mediaUrl,
    voiceDuration,
    fileName,
    fileSize,
    reactions: [],
    replyToId,
    replyToSenderName,
    replyToContent,
  };

  messages[channelId].push(newMsg);

  const ch = channels.find((c) => c.id === channelId);
  if (ch) {
    ch.lastMessageAt = newMsg.timestamp;
  }

  res.status(201).json(newMsg);
});

app.post("/api/reactions", (req, res) => {
  const { channelId, messageId, emoji, userId } = req.body;
  const channelMsgs = messages[channelId] || [];
  const msg = channelMsgs.find((m) => m.id === messageId);

  if (msg) {
    const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        existingReaction.users = existingReaction.users.filter((u) => u !== userId);
        existingReaction.count = existingReaction.users.length;
      } else {
        existingReaction.users.push(userId);
        existingReaction.count = existingReaction.users.length;
      }
    } else {
      msg.reactions.push({ emoji, count: 1, users: [userId] });
    }
    msg.reactions = msg.reactions.filter((r) => r.count > 0);

    res.json({ success: true, reactions: msg.reactions });
  } else {
    res.status(404).json({ error: "Message not found" });
  }
});

app.post("/api/messages/delete", (req, res) => {
  const { channelId, messageId } = req.body;
  if (messages[channelId]) {
    messages[channelId] = messages[channelId].filter((m) => m.id !== messageId);
  }
  res.json({ success: true });
});

app.post("/api/messages/pin", (req, res) => {
  const { channelId, messageId } = req.body;
  if (messages[channelId]) {
    const target = messages[channelId].find((m) => m.id === messageId);
    if (target) {
      target.isPinned = !target.isPinned;
      res.json(target);
      return;
    }
  }
  res.status(404).json({ error: "Message not found" });
});

app.post("/api/messages/star", (req, res) => {
  const { channelId, messageId } = req.body;
  if (messages[channelId]) {
    const target = messages[channelId].find((m) => m.id === messageId);
    if (target) {
      target.isStarred = !target.isStarred;
      res.json(target);
      return;
    }
  }
  res.status(404).json({ error: "Message not found" });
});

app.post("/api/system/reset", (req, res) => {
  const { password } = req.body;

  if (password !== "0000") {
    res.status(401).json({ error: "Incorrect reset password. PIN must be 0000." });
    return;
  }

  channels = [
    {
      id: "general-lounge",
      name: "general-lounge",
      type: "public_group",
      description: "Main lounge for catching up with friends!",
      icon: "💬",
      createdBy: "system",
      members: ["user_kasun", "user_dilshan", "user_nimali", "user_amal"],
      category: "TEXT CHANNELS",
      isPinned: true,
    },
    {
      id: "sri-lanka-vibes",
      name: "sri-lanka-vibes",
      type: "public_group",
      description: "🇱🇰 Share local updates, trip plans, food spots & fun memes",
      icon: "🇱🇰",
      createdBy: "system",
      members: ["user_kasun", "user_dilshan", "user_nimali", "user_amal"],
      category: "TEXT CHANNELS",
    },
    {
      id: "gaming-squad",
      name: "gaming-squad",
      type: "public_group",
      description: "🎮 Coordination room for evening game sessions",
      icon: "🎮",
      createdBy: "system",
      members: ["user_kasun", "user_dilshan", "user_amal"],
      category: "GAMING & FUN",
    },
    {
      id: "music-and-chill",
      name: "music-and-chill",
      type: "public_group",
      description: "🎵 Post songs, voice audio notes, and playlists",
      icon: "🎵",
      createdBy: "system",
      members: ["user_kasun", "user_nimali", "user_amal"],
      category: "GAMING & FUN",
    },
  ];

  messages = {
    "general-lounge": [
      {
        id: "msg_1",
        channelId: "general-lounge",
        senderId: "user_kasun",
        senderName: "Kasun Perera",
        senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        content: "System Factory Reset Completed! 🇱🇰 Welcome back to TalkTribe.",
        timestamp: new Date().toISOString(),
        type: "text",
        reactions: [{ emoji: "✨", count: 1, users: ["user_kasun"] }],
        isPinned: true,
      },
    ],
  };

  activeUsersMap.clear();
  DEFAULT_USERS.forEach((u) => activeUsersMap.set(u.id, u));

  res.json({ success: true, message: "System factory reset successfully executed." });
});

app.get("/api/users", (_req, res) => {
  res.json(Array.from(activeUsersMap.values()));
});

app.post("/api/users/profile", (req, res) => {
  const { id, name, avatar, status, customStatus, bio } = req.body;
  if (!id) {
    res.status(400).json({ error: "User ID required" });
    return;
  }
  let existing = activeUsersMap.get(id);
  if (existing) {
    existing = {
      ...existing,
      name: name || existing.name,
      avatar: avatar || existing.avatar,
      status: status || existing.status,
      customStatus: customStatus !== undefined ? customStatus : existing.customStatus,
      bio: bio !== undefined ? bio : existing.bio,
    };
    activeUsersMap.set(id, existing);
    res.json(existing);
  } else {
    const newUser: User = {
      id,
      name: name || "Friend",
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      status: status || "online",
      customStatus: customStatus || "",
      bio: bio || "",
      joinedAt: new Date().toISOString(),
    };
    activeUsersMap.set(id, newUser);
    res.status(201).json(newUser);
  }
});

app.post("/api/upload", (req, res) => {
  const { fileName, fileType, fileData } = req.body;
  if (!fileData) {
    res.status(400).json({ error: "No file content provided" });
    return;
  }
  res.json({
    url: fileData,
    fileName: fileName || "attached_file",
    fileSize: `${Math.round(fileData.length / 1024)} KB`,
    fileType: fileType || "application/octet-stream",
  });
});

export default app;
