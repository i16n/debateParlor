"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  ClientToServerEvents,
  Room,
  ServerToClientEvents,
  User,
} from "../lib/types";

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<boolean>;
  currentUser: User | null;
  partner: User | null;
  isConnected: boolean;
  isWaiting: boolean;
  isTimerRunning: boolean;
  timeRemaining: number;
  topic: string | null;
  setUserTopic: (topic: string) => Promise<boolean>;
  isUserAgreed: boolean;
  toggleAgree: () => Promise<boolean>;
  isPartnerAgreed: boolean;
  restartKey: number;
  joinRoom: (
    userName: string,
    roomType: "free-topic" | "assigned-topic"
  ) => Promise<Room | null>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [isUserAgreed, setIsUserAgreed] = useState(false);
  const [isPartnerAgreed, setIsPartnerAgreed] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [restartKey, setRestartKey] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    // Create a socket instance
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
    );

    setSocket(
      socketInstance as Socket<ServerToClientEvents, ClientToServerEvents>
    );

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      console.log("Connected to socket server");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    };

    const onUserJoined = (user: User) => {
      setPartner(user);
      setIsWaiting(false);
      setIsTimerRunning(true);

      // Note: We don't need to add a system message here anymore
      // since the server will send it through the 'message' event
    };

    const onUserLeft = (userId: string) => {
      if (partner && partner.id === userId) {
        setPartner(null);

        // Add system message
        const systemMessage: ChatMessage = {
          id: uuidv4(),
          content: `${partner.name} has left the chat.`,
          sender: "System",
          timestamp: new Date(),
          isSystem: true,
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    };

    const onMessage = (message: ChatMessage) => {
      console.log("Received message:", {
        sender: message.sender,
        content:
          message.content.substring(0, 20) +
          (message.content.length > 20 ? "..." : ""),
        timestamp: message.timestamp,
      });
      setMessages((prev) => [...prev, message]);
    };

    const onTopicChanged = (newTopic: string) => {
      setTopic(newTopic);

      // Reset agreement states with a slight delay to ensure it happens after any in-progress state updates
      setTimeout(() => {
        setIsUserAgreed(false);
        setIsPartnerAgreed(false);
      }, 50);

      // Add agreement success message first
      const agreementMessage: ChatMessage = {
        id: uuidv4(),
        content: "You both agree on this one!",
        sender: "System",
        timestamp: new Date(),
        isSystem: true,
        isAgreement: true, // Special flag for styling
      };
      setMessages((prev) => [...prev, agreementMessage]);

      // Add topic changed message
      const topicMessage: ChatMessage = {
        id: uuidv4(),
        content: `Topic changed to: "${newTopic}"`,
        sender: "System",
        timestamp: new Date(),
        isSystem: true,
        isTopicChange: true, // Special flag for styling
      };
      setMessages((prev) => [...prev, topicMessage]);
    };

    const onTimerReset = () => {
      setTimeRemaining(120); // Reset to 2 minutes
      setRestartKey((prev) => prev + 1);
      setIsTimerRunning(true);
    };

    const onRoomClosed = () => {
      // Add system message
      const systemMessage: ChatMessage = {
        id: uuidv4(),
        content: "The debate session has ended.",
        sender: "System",
        timestamp: new Date(),
        isSystem: true,
      };
      setMessages((prev) => [...prev, systemMessage]);
      setIsTimerRunning(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);
    socket.on("message", onMessage);
    socket.on("topicChanged", onTopicChanged);
    socket.on("timerReset", onTimerReset);
    socket.on("roomClosed", onRoomClosed);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
      socket.off("message", onMessage);
      socket.off("topicChanged", onTopicChanged);
      socket.off("timerReset", onTimerReset);
      socket.off("roomClosed", onRoomClosed);
    };
  }, [socket, partner]);

  // Update user agreement status
  useEffect(() => {
    if (!room || !currentUser) return;

    const userAgreedStatus = room.userAgreed[currentUser.id] || false;
    setIsUserAgreed(userAgreedStatus);

    if (partner) {
      const partnerAgreedStatus = room.userAgreed[partner.id] || false;
      setIsPartnerAgreed(partnerAgreedStatus);
    }
  }, [room, currentUser, partner]);

  const joinRoom = async (
    userName: string,
    roomType: "free-topic" | "assigned-topic"
  ) => {
    if (!socket || !socket.connected) return null;

    return new Promise<Room>((resolve) => {
      socket.emit("joinRoom", { name: userName }, roomType, (roomData) => {
        setRoom(roomData);
        setTopic(roomData.topic || null);

        // Find current user
        const user = roomData.users.find((u) => u.name === userName) || null;
        setCurrentUser(user);

        // Find partner if exists
        const otherUser =
          roomData.users.find((u) => u.name !== userName) || null;
        setPartner(otherUser);

        setIsWaiting(!otherUser);
        setIsTimerRunning(!!otherUser);

        // Set initial messages
        setMessages(roomData.messages);

        resolve(roomData);
      });
    });
  };

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!socket || !socket.connected) return false;

    return new Promise((resolve) => {
      socket.emit("sendMessage", content, (delivered) => {
        resolve(delivered);
      });
    });
  };

  const setUserTopic = async (newTopic: string): Promise<boolean> => {
    if (!socket || !socket.connected) return false;

    return new Promise((resolve) => {
      socket.emit("setTopic", newTopic, (success) => {
        if (success) {
          setTopic(newTopic);
        }
        resolve(success);
      });
    });
  };

  const toggleAgree = async (): Promise<boolean> => {
    if (!socket || !socket.connected) return false;

    const newAgreedState = !isUserAgreed;

    return new Promise((resolve) => {
      socket.emit("agreeOnTopic", newAgreedState, (success, allAgreed) => {
        if (success) {
          setIsUserAgreed(newAgreedState);

          // If both agree, topic will be changed automatically by the server
          if (allAgreed) {
            // We'll receive a topicChanged event from the server
          }
        }
        resolve(success);
      });
    });
  };

  const contextValue: ChatContextType = {
    messages,
    sendMessage,
    currentUser,
    partner,
    isConnected,
    isWaiting,
    isTimerRunning,
    timeRemaining,
    topic,
    setUserTopic,
    isUserAgreed,
    toggleAgree,
    isPartnerAgreed,
    restartKey,
    joinRoom,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};
