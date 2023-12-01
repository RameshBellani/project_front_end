const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store online users by room
const onlineUsersByRoom = {};
// Store chat history by room
const chatHistoryByRoom = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Handle user joining
  socket.on("join_room", (data) => {
    socket.join(data.room);

    // Initialize online users for the room if not exists
    if (!onlineUsersByRoom[data.room]) {
      onlineUsersByRoom[data.room] = {};
    }

    // Add user to the online users for the room
    onlineUsersByRoom[data.room][socket.id] = {
      username: data.username,
      status: "online",
    };

    // Initialize chat history for the room if not exists
    if (!chatHistoryByRoom[data.room]) {
      chatHistoryByRoom[data.room] = [];
    }

    // Send chat history to the user who joined
    socket.emit("chat_history", chatHistoryByRoom[data.room]);

    io.to(data.room).emit("update_users", Object.values(onlineUsersByRoom[data.room]));
    console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    // Find the room the user is in
    const room = Object.keys(socket.rooms).find((room) => room !== socket.id);

    if (room && onlineUsersByRoom[room] && onlineUsersByRoom[room][socket.id]) {
      // Update user status to "offline" for the specific room
      onlineUsersByRoom[room][socket.id].status = "offline";
      io.to(room).emit("update_users", Object.values(onlineUsersByRoom[room]));
      console.log(`User with ID: ${socket.id} disconnected from room: ${room}`);
    }
    
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);

    // Save the message to chat history
    chatHistoryByRoom[data.room].push(data);
  });
});

const port = 3004;
server.listen(port, () => {
  console.log(`SERVER RUNNING AT ${port}`);
});
