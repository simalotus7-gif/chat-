import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { Channel, Message, User, TypingStatus, VoiceParticipant } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Pre-populated default user (Host user)
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

// Pre-populated default channels
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

// Pre-populated messages
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
    {
      id: "msg_4",
      channelId: "general-lounge",
      senderId: "user_amal",
      senderName: "Amal Jayasinghe",
      senderAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80",
      content: "Adoo patta photo ekak! Ok, set wemu. Text/msg karala dynamic plan ekak hadamu!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: "text",
      reactions: [{ emoji: "🎉", count: 2, users: ["user_kasun", "user_dilshan"] }],
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
  "gaming-squad": [
    {
      id: "msg_g_1",
      channelId: "gaming-squad",
      senderId: "user_amal",
      senderName: "Amal Jayasinghe",
      senderAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80",
      content: "Ada rē 9.00PM Discord or voice call log wela match ekak gahamuda?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      type: "text",
      reactions: [{ emoji: "🎮", count: 3, users: ["user_kasun", "user_dilshan", "user_amal"] }],
    },
  ],
  "dm-user_dilshan": [
    {
      id: "msg_dm1",
      channelId: "dm-user_dilshan",
      senderId: "user_dilshan",
      senderName: "Dilshan Silva",
      senderAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      content: "Machan, project link ekak tiyenawada mawa add karaganna?",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      type: "text",
      reactions: [],
    },
    {
      id: "msg_dm2",
      channelId: "dm-user_dilshan",
      senderId: "user_kasun",
      senderName: "Kasun Perera",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      content: "Ow machan, me app eken share invite link eka yawapan yaluwoth ekka direct msg karanna!",
      timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
      type: "text",
      reactions: [{ emoji: "👍", count: 1, users: ["user_dilshan"] }],
    },
  ],
};

// Registered clients list & user statuses
let activeUsersMap: Map<string, User> = new Map();
DEFAULT_USERS.forEach((u) => activeUsersMap.set(u.id, u));

// Voice Call Active State by channel ID
let voiceCallRooms: Record<string, VoiceParticipant[]> = {};

// HTTP Routes
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

  // Broadcast new channel to all connected clients
  broadcastWS({
    type: "channel_created",
    channel: newChannel,
  });

  res.status(201).json(newChannel);
});

app.get("/api/messages/:channelId", (req, res) => {
  const { channelId } = req.params;
  res.json(messages[channelId] || []);
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

    broadcastWS({
      type: "user_updated",
      user: existing,
    });
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
    broadcastWS({
      type: "user_joined",
      user: newUser,
    });
    res.status(201).json(newUser);
  }
});

// Handle media/file upload mock (returns base64 data or data URL)
app.post("/api/upload", (req, res) => {
  const { fileName, fileType, fileData } = req.body;
  if (!fileData) {
    res.status(400).json({ error: "No file content provided" });
    return;
  }
  // Return the data URI back for client display
  res.json({
    url: fileData,
    fileName: fileName || "attached_file",
    fileSize: `${Math.round(fileData.length / 1024)} KB`,
    fileType: fileType || "application/octet-stream",
  });
});

// REST Endpoint for Sending Message (works on serverless & Vercel)
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

  broadcastWS({
    type: "new_message",
    message: newMsg,
  });

  res.status(201).json(newMsg);
});

// REST Endpoint for Reaction Toggle
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

    broadcastWS({
      type: "message_reaction_updated",
      channelId,
      messageId,
      reactions: msg.reactions,
    });
    res.json({ success: true, reactions: msg.reactions });
  } else {
    res.status(404).json({ error: "Message not found" });
  }
});

// REST Endpoint for Message Delete
app.post("/api/messages/delete", (req, res) => {
  const { channelId, messageId } = req.body;
  if (messages[channelId]) {
    messages[channelId] = messages[channelId].filter((m) => m.id !== messageId);
    broadcastWS({ type: "message_deleted", channelId, messageId });
  }
  res.json({ success: true });
});

// REST Endpoint for Pin / Unpin
app.post("/api/messages/pin", (req, res) => {
  const { channelId, messageId } = req.body;
  if (messages[channelId]) {
    const target = messages[channelId].find((m) => m.id === messageId);
    if (target) {
      target.isPinned = !target.isPinned;
      broadcastWS({ type: "message_updated", message: target });
      res.json(target);
      return;
    }
  }
  res.status(404).json({ error: "Message not found" });
});

// REST Endpoint for Star / Unstar
app.post("/api/messages/star", (req, res) => {
  const { channelId, messageId } = req.body;
  if (messages[channelId]) {
    const target = messages[channelId].find((m) => m.id === messageId);
    if (target) {
      target.isStarred = !target.isStarred;
      broadcastWS({ type: "message_updated", message: target });
      res.json(target);
      return;
    }
  }
  res.status(404).json({ error: "Message not found" });
});

// REST Endpoint for Factory Reset (Protected by Password 0000)
app.post("/api/system/reset", (req, res) => {
  const { password } = req.body;

  if (password !== "0000") {
    res.status(401).json({ error: "Incorrect reset password. PIN must be 0000." });
    return;
  }

  // Perform full factory reset of in-memory data
  channels = [
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

  for (const key in voiceCallRooms) {
    delete voiceCallRooms[key];
  }

  // Broadcast WebSocket System Reset Event
  broadcastWS({
    type: "system_reset",
    channels,
    users: Array.from(activeUsersMap.values()),
  });

  res.json({ success: true, message: "System factory reset successfully executed." });
});

// Delete / Kick User Endpoint
app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  activeUsersMap.delete(userId);

  // Remove user from channels
  channels.forEach((ch) => {
    ch.members = ch.members.filter((m) => m !== userId);
  });

  broadcastWS({
    type: "user_left",
    userId,
    users: Array.from(activeUsersMap.values()),
  });

  res.json({ success: true, message: `User ${userId} removed.` });
});

// Create HTTP server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ClientInfo {
  ws: WebSocket;
  userId: string;
  userName: string;
  channelId?: string;
}

const connectedClients = new Set<ClientInfo>();

function broadcastWS(data: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(data);
  for (const client of connectedClients) {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

wss.on("connection", (ws: WebSocket) => {
  let clientInfo: ClientInfo = {
    ws,
    userId: "guest_" + Math.random().toString(36).substring(2, 7),
    userName: "Guest",
  };
  connectedClients.add(clientInfo);

  // Send current initial state
  ws.send(
    JSON.stringify({
      type: "init",
      users: Array.from(activeUsersMap.values()),
      channels,
      voiceCallRooms,
    })
  );

  ws.on("message", (rawMessage: string) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      switch (data.type) {
        case "auth": {
          clientInfo.userId = data.user.id;
          clientInfo.userName = data.user.name;
          
          // Update presence in active map
          let userObj = activeUsersMap.get(data.user.id) || {
            id: data.user.id,
            name: data.user.name,
            avatar: data.user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            status: "online",
            joinedAt: new Date().toISOString(),
          };
          userObj.status = "online";
          activeUsersMap.set(data.user.id, userObj);

          broadcastWS({
            type: "presence_change",
            userId: userObj.id,
            status: "online",
            users: Array.from(activeUsersMap.values()),
          });
          break;
        }

        case "join_channel": {
          clientInfo.channelId = data.channelId;
          break;
        }

        case "send_message": {
          const { channelId, senderId, senderName, senderAvatar, content, msgType, mediaUrl, voiceDuration, fileName, fileSize, replyToId, replyToSenderName, replyToContent } = data;
          
          if (!messages[channelId]) {
            messages[channelId] = [];
          }

          const newMsg: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            channelId,
            senderId,
            senderName,
            senderAvatar,
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

          // Update lastMessageAt on channel
          const ch = channels.find((c) => c.id === channelId);
          if (ch) {
            ch.lastMessageAt = newMsg.timestamp;
          }

          broadcastWS({
            type: "new_message",
            message: newMsg,
          });
          break;
        }

        case "toggle_reaction": {
          const { channelId, messageId, emoji, userId } = data;
          const channelMsgs = messages[channelId] || [];
          const msgIndex = channelMsgs.findIndex((m) => m.id === messageId);
          
          if (msgIndex !== -1) {
            const msg = channelMsgs[msgIndex];
            const existingReaction = msg.reactions.find((r) => r.emoji === emoji);

            if (existingReaction) {
              const hasUser = existingReaction.users.includes(userId);
              if (hasUser) {
                // Remove user reaction
                existingReaction.users = existingReaction.users.filter((u) => u !== userId);
                existingReaction.count = existingReaction.users.length;
              } else {
                // Add user reaction
                existingReaction.users.push(userId);
                existingReaction.count = existingReaction.users.length;
              }
            } else {
              // Add new reaction object
              msg.reactions.push({
                emoji,
                count: 1,
                users: [userId],
              });
            }

            // Filter out reactions with 0 count
            msg.reactions = msg.reactions.filter((r) => r.count > 0);

            broadcastWS({
              type: "message_reaction_updated",
              channelId,
              messageId,
              reactions: msg.reactions,
            });
          }
          break;
        }

        case "delete_message": {
          const { channelId, messageId } = data;
          if (messages[channelId]) {
            messages[channelId] = messages[channelId].filter((m) => m.id !== messageId);
            broadcastWS({
              type: "message_deleted",
              channelId,
              messageId,
            });
          }
          break;
        }

        case "pin_message": {
          const { channelId, messageId } = data;
          if (messages[channelId]) {
            const target = messages[channelId].find((m) => m.id === messageId);
            if (target) {
              target.isPinned = !target.isPinned;
              broadcastWS({
                type: "message_updated",
                message: target,
              });
            }
          }
          break;
        }

        case "star_message": {
          const { channelId, messageId } = data;
          if (messages[channelId]) {
            const target = messages[channelId].find((m) => m.id === messageId);
            if (target) {
              target.isStarred = !target.isStarred;
              broadcastWS({
                type: "message_updated",
                message: target,
              });
            }
          }
          break;
        }

        case "typing_status": {
          const { channelId, userId, userName, isTyping } = data;
          broadcastWS(
            {
              type: "typing_update",
              channelId,
              userId,
              userName,
              isTyping,
            },
            ws
          );
          break;
        }

        case "presence_update": {
          const { userId, status, customStatus } = data;
          const u = activeUsersMap.get(userId);
          if (u) {
            u.status = status || u.status;
            if (customStatus !== undefined) u.customStatus = customStatus;
            broadcastWS({
              type: "presence_change",
              userId,
              status: u.status,
              customStatus: u.customStatus,
              users: Array.from(activeUsersMap.values()),
            });
          }
          break;
        }

        case "voice_join": {
          const { channelId, user, isMuted, isVideoOn } = data;
          if (!voiceCallRooms[channelId]) {
            voiceCallRooms[channelId] = [];
          }
          const room = voiceCallRooms[channelId];
          const existingParticipantIndex = room.findIndex((p) => p.user.id === user.id);
          const participant: VoiceParticipant = {
            user,
            isMuted: isMuted || false,
            isDeafened: false,
            isSpeaking: false,
            isVideoOn: isVideoOn || false,
          };

          if (existingParticipantIndex !== -1) {
            room[existingParticipantIndex] = participant;
          } else {
            room.push(participant);
          }

          broadcastWS({
            type: "voice_room_updated",
            channelId,
            participants: room,
            voiceCallRooms,
          });
          break;
        }

        case "voice_leave": {
          const { channelId, userId } = data;
          if (voiceCallRooms[channelId]) {
            voiceCallRooms[channelId] = voiceCallRooms[channelId].filter((p) => p.user.id !== userId);
            if (voiceCallRooms[channelId].length === 0) {
              delete voiceCallRooms[channelId];
            }
            broadcastWS({
              type: "voice_room_updated",
              channelId,
              participants: voiceCallRooms[channelId] || [],
              voiceCallRooms,
            });
          }
          break;
        }

        case "voice_toggle_state": {
          const { channelId, userId, isMuted, isVideoOn, isSpeaking } = data;
          const room = voiceCallRooms[channelId];
          if (room) {
            const p = room.find((part) => part.user.id === userId);
            if (p) {
              if (isMuted !== undefined) p.isMuted = isMuted;
              if (isVideoOn !== undefined) p.isVideoOn = isVideoOn;
              if (isSpeaking !== undefined) p.isSpeaking = isSpeaking;

              broadcastWS({
                type: "voice_room_updated",
                channelId,
                participants: room,
                voiceCallRooms,
              });
            }
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error("Error handling WS message:", err);
    }
  });

  ws.on("close", () => {
    connectedClients.delete(clientInfo);

    // Set status to offline if no other connections for this user
    const hasOtherConnection = Array.from(connectedClients).some(
      (c) => c.userId === clientInfo.userId
    );

    if (!hasOtherConnection && clientInfo.userId) {
      const u = activeUsersMap.get(clientInfo.userId);
      if (u) {
        u.status = "offline";
        broadcastWS({
          type: "presence_change",
          userId: u.id,
          status: "offline",
          users: Array.from(activeUsersMap.values()),
        });
      }
    }
  });
});

// Setup Vite development server or production static files
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`TalkTribe server running on http://0.0.0.0:${PORT}`);
  });
}

start();
