import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, User, Users, LogOut, MessageSquare, Hash, Copy, Check, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  type: "chat" | "status";
  userId?: string;
  userName?: string;
  content: string;
  timestamp: number;
}

interface UserInfo {
  id: string;
  name: string;
}

const STORAGE_KEY = "live_chat_user_v1";

export default function App() {
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserInfo[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinMode, setJoinMode] = useState<"new" | "id">("new");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { id, name: savedName } = JSON.parse(saved);
        if (id && savedName) {
          setName(savedName);
          setUserId(id);
          setIsJoined(true);
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isJoined && (name || userId)) {
      const newSocket = io();
      setSocket(newSocket);

      newSocket.emit("join", { name, id: userId });

      newSocket.on("init", ({ userId: serverId, userName: serverName, messages, users }) => {
        setUserId(serverId);
        setName(serverName);
        setMessages(messages);
        setOnlineUsers(users);
        
        // Save to local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: serverId, name: serverName }));
      });

      newSocket.on("new_message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("status_update", ({ user, status, message }) => {
        if (status === "connected") {
          setOnlineUsers((prev) => {
            if (prev.find(u => u.id === user.id)) return prev;
            return [...prev, user];
          });
        } else {
          setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
        }
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("error", (err) => {
        alert(err.message);
        setIsJoined(false);
        localStorage.removeItem(STORAGE_KEY);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isJoined]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinMode === "new" && name.trim()) {
      setIsJoined(true);
    } else if (joinMode === "id" && loginId.trim()) {
      setUserId(loginId.trim());
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit("send_message", {
        userId,
        userName: name,
        content: input.trim(),
      });
      setInput("");
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
              <MessageSquare className="text-emerald-500 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Live Chat</h1>
            <p className="text-white/50 text-center">Join the public conversation</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setJoinMode("new")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${joinMode === "new" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
            >
              New User
            </button>
            <button 
              onClick={() => setJoinMode("id")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${joinMode === "id" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
            >
              Login with ID
            </button>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            {joinMode === "new" ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 ml-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder:text-white/20"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 ml-1">
                  Unique User ID
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Paste your ID here"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder:text-white/20"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={joinMode === "new" ? !name.trim() : !loginId.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              {joinMode === "new" ? "Join Chat" : "Login"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col font-sans text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#141414]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Hash className="text-black w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Public Room</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                {onlineUsers.length} Online
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold">{name}</span>
              <button 
                onClick={copyId}
                className="text-[9px] text-white/40 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                title="Click to copy ID"
              >
                {copied ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
                {copied ? "Copied!" : userId.slice(0, 8) + "..."}
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.type === 'status' ? 0 : (msg.userId === userId ? 10 : -10) }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.type === 'status' ? 'justify-center' : (msg.userId === userId ? 'justify-end' : 'justify-start')}`}
                >
                  {msg.type === 'status' ? (
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      {msg.content}
                    </span>
                  ) : (
                    <div className={`max-w-[80%] sm:max-w-[60%] ${msg.userId === userId ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                          {msg.userId === userId ? 'You' : msg.userName}
                        </span>
                        <span className="text-[10px] text-white/20">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.userId === userId 
                          ? 'bg-emerald-500 text-black font-medium rounded-tr-none shadow-lg shadow-emerald-500/10' 
                          : 'bg-[#1a1a1a] text-white border border-white/10 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#0a0a0a]">
            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm placeholder:text-white/20 shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black rounded-xl transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Online Users */}
        <aside className="hidden lg:flex w-72 border-l border-white/10 bg-[#0f0f0f] flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Online Now</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {onlineUsers.map((u) => (
              <div 
                key={u.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/40 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-colors">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f0f0f] rounded-full"></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">{u.name}</span>
                    {u.id === userId && <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1 rounded border border-emerald-500/20">YOU</span>}
                  </div>
                  <span className="text-[9px] text-white/20 uppercase tracking-tighter">Active</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* User Info Card at bottom of sidebar */}
          <div className="p-4 mt-auto border-t border-white/10 bg-white/5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">Your Unique ID</span>
              <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-white/5">
                <code className="text-[10px] text-emerald-500/70 font-mono truncate mr-2">{userId}</code>
                <button 
                  onClick={copyId}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-white/40" />}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
