import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // In-memory storage
  const messages: any[] = [];
  const onlineUsers = new Map<string, { id: string; name: string }>();

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", ({ name }) => {
      const userId = uuidv4();
      const user = { id: userId, name };
      
      // Store user
      onlineUsers.set(socket.id, user);

      // Send initial state (last 50 messages and current online users)
      socket.emit("init", { 
        userId, 
        messages: messages.slice(-50), 
        users: Array.from(onlineUsers.values()) 
      });

      // Broadcast join status
      const statusMsg = {
        id: uuidv4(),
        type: "status",
        content: `${name} joined the chat`,
        timestamp: Date.now(),
      };
      
      messages.push(statusMsg);
      if (messages.length > 100) messages.shift();

      io.emit("status_update", { user, status: "connected", message: statusMsg });
    });

    socket.on("send_message", (data) => {
      const message = {
        id: uuidv4(),
        type: "chat",
        userId: data.userId,
        userName: data.userName,
        content: data.content,
        timestamp: Date.now(),
      };

      // Store message
      messages.push(message);
      if (messages.length > 100) messages.shift();

      io.emit("new_message", message);
    });

    socket.on("disconnect", () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        onlineUsers.delete(socket.id);
        const statusMsg = {
          id: uuidv4(),
          type: "status",
          content: `${user.name} left the chat`,
          timestamp: Date.now(),
        };
        messages.push(statusMsg);
        if (messages.length > 100) messages.shift();
        
        io.emit("status_update", { user, status: "disconnected", message: statusMsg });
      }
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
