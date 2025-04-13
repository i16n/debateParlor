const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const { getRandomTopic } = require("./server/topics");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory storage for rooms and users
const rooms = new Map();
const users = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // In production, you'll want to restrict this
      methods: ["GET", "POST"],
    },
    connectionStateRecovery: {
      // Enable socket.io reconnection
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  // Debug middleware to log all socket activity
  io.use((socket, next) => {
    console.log(`New socket connection: ${socket.id}`);
    socket.onAny((event, ...args) => {
      console.log(`[Socket ${socket.id}] ${event}`);
    });
    next();
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a room
    socket.on("joinRoom", (userData, roomType, callback) => {
      console.log(`User ${userData.name} trying to join ${roomType} room`);

      const userId = uuidv4();
      const user = {
        id: userId,
        name: userData.name,
        socketId: socket.id,
      };

      // Store user
      users.set(userId, user);

      // Find available room or create new one
      let room;
      let isNewRoom = false;

      // Check for available rooms
      for (const [roomId, roomData] of rooms.entries()) {
        if (
          roomData.type === roomType &&
          roomData.users.length === 1 &&
          roomData.isActive
        ) {
          room = roomData;
          console.log(
            `Found existing ${roomType} room ${roomId} with ${roomData.users.length} users`
          );
          break;
        }
      }

      // Create new room if none available
      if (!room) {
        const roomId = uuidv4();
        room = {
          id: roomId,
          type: roomType,
          users: [],
          messages: [],
          userAgreed: {},
          startTime: new Date(),
          isActive: true,
        };

        if (roomType === "assigned-topic") {
          room.topic = getRandomTopic();
        }

        rooms.set(roomId, room);
        isNewRoom = true;
        console.log(`Created new ${roomType} room ${roomId}`);
      }

      // Add user to room
      room.users.push(user);
      user.roomId = room.id;

      // Join socket room
      socket.join(room.id);
      console.log(`Socket ${socket.id} joined room ${room.id}`);
      console.log(`Current socket rooms:`, [...socket.rooms]);

      // Log current room state
      console.log(
        `Room ${room.id} now has ${room.users.length} users: ${room.users
          .map((u) => u.name)
          .join(", ")}`
      );

      // Notify other user if present
      if (room.users.length > 1) {
        const otherUser = room.users.find((u) => u.id !== userId);
        if (otherUser) {
          console.log(
            `Notifying other user ${otherUser.name} that ${user.name} joined`
          );

          // Emit userJoined event to the other user (for state management only)
          socket.to(room.id).emit("userJoined", user);

          // Create and send message to first user about second user joining
          const userJoinedMessage = {
            id: uuidv4(),
            content: `${user.name} has joined the chat.`,
            sender: "System",
            timestamp: new Date(),
            isSystem: true,
          };

          // Add to room history
          room.messages.push(userJoinedMessage);

          // Explicitly send to the first user
          io.to(otherUser.socketId).emit("message", userJoinedMessage);

          // Send message to the second user about the first user
          const otherUserMessage = {
            id: uuidv4(),
            content: `${otherUser.name} has joined the chat.`,
            sender: "System",
            timestamp: new Date(),
            isSystem: true,
          };

          // Send directly to the second user (don't add to room history)
          io.to(socket.id).emit("message", otherUserMessage);
        }
      }

      // Return room data to client (without any special modification)
      callback(room);
    });

    // Send a message
    socket.on("sendMessage", (content, callback) => {
      // Find user and room
      const user = [...users.values()].find((u) => u.socketId === socket.id);
      if (!user || !user.roomId) {
        console.log(
          "Message failed: No user or room ID found for socket",
          socket.id
        );
        callback(false);
        return;
      }

      const room = rooms.get(user.roomId);
      if (!room) {
        console.log("Message failed: Room not found", user.roomId);
        callback(false);
        return;
      }

      // Create message
      const message = {
        id: uuidv4(),
        content,
        sender: user.name,
        timestamp: new Date(),
      };

      // Add to room messages
      room.messages.push(message);

      console.log(`Broadcasting message to room ${room.id}:`, {
        sender: user.name,
        roomUsers: room.users.map((u) => u.name),
        socketRooms: [...socket.rooms], // Debug to see what rooms this socket is in
        content: content.substring(0, 20) + (content.length > 20 ? "..." : ""), // First 20 chars for privacy
      });

      // Broadcast to room
      io.to(room.id).emit("message", message);

      callback(true);
    });

    // Set topic (free-topic room only)
    socket.on("setTopic", (topic, callback) => {
      const user = [...users.values()].find((u) => u.socketId === socket.id);
      if (!user || !user.roomId) {
        callback(false);
        return;
      }

      const room = rooms.get(user.roomId);
      if (!room || room.type !== "free-topic") {
        callback(false);
        return;
      }

      // Set topic
      room.topic = topic;

      // Broadcast to room
      io.to(room.id).emit("topicChanged", topic);

      callback(true);
    });

    // Toggle agreement on topic (assigned-topic room only)
    socket.on("agreeOnTopic", (agreed, callback) => {
      const user = [...users.values()].find((u) => u.socketId === socket.id);
      if (!user || !user.roomId) {
        callback(false, false);
        return;
      }

      const room = rooms.get(user.roomId);
      if (!room || room.type !== "assigned-topic") {
        callback(false, false);
        return;
      }

      // Update user agreement
      room.userAgreed[user.id] = agreed;

      // Check if all users agree
      const allAgreed =
        room.users.length > 1 &&
        room.users.every((u) => room.userAgreed[u.id] === true);

      // If all agree, change topic and reset timer
      if (allAgreed) {
        // Assign new topic
        const newTopic = getRandomTopic();
        room.topic = newTopic;

        // Reset agreements
        room.userAgreed = {};

        // Broadcast topic change and timer reset
        io.to(room.id).emit("topicChanged", newTopic);
        io.to(room.id).emit("timerReset");
      }

      callback(true, allAgreed);
    });

    // Leave room
    socket.on("leaveRoom", () => {
      handleDisconnect(socket.id);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      handleDisconnect(socket.id);
    });
  });

  // Helper function to handle user disconnect/leave
  function handleDisconnect(socketId) {
    console.log(`Handling disconnect for socket: ${socketId}`);

    const user = [...users.values()].find((u) => u.socketId === socketId);
    if (!user) {
      console.log(`No user found for socket: ${socketId}`);
      return;
    }

    const roomId = user.roomId;
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        console.log(`User ${user.name} leaving room ${roomId}`);

        // Remove user from room
        room.users = room.users.filter((u) => u.id !== user.id);
        console.log(`Room ${roomId} now has ${room.users.length} users`);

        // Notify other users
        io.to(roomId).emit("userLeft", user.id);

        // Close room if empty
        if (room.users.length === 0) {
          room.isActive = false;
          io.to(roomId).emit("roomClosed");
          console.log(`Room ${roomId} marked as inactive (empty)`);
          // We keep the room in memory for history purposes
        }
      }
    }

    // Remove user
    users.delete(user.id);
    console.log(`User ${user.name} removed from users map`);
  }

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
