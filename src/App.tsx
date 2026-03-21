import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, User, Users, LogOut, MessageSquare, Hash } from "lucide-react";
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

export default function App() {
  const [name, setName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserInfo[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isJoined && name) {
      const newSocket = io();
      setSocket(newSocket);

      newSocket.emit("join", { name });

      newSocket.on("init", ({ userId, messages, users }) => {
        setUserId(userId);
        setMessages(messages);
        setOnlineUsers(users);
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

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isJoined, name]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
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
            <p className="text-white/50 text-center">Enter your name to join the public chat room</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 ml-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder:text-white/20"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Join Chat
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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium">{name}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
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
                  <span className="text-xs font-medium truncate">{u.name}</span>
                  <span className="text-[9px] text-white/20 uppercase tracking-tighter">Active</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
