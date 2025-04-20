"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChatContext } from "../../contexts/ChatContext";
import ChatMessage from "../../components/ChatMessage";
import ChatInput from "../../components/ChatInput";
import Timer from "../../components/Timer";
import WiredButton from "../../components/WiredButton";
import { ChatMessage as ChatMessageType } from "../../lib/types";

export default function ChangeMyMindChat() {
  const {
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
    restartKey,
    joinRoom,
  } = useChatContext();

  const [userName, setUserName] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [showTopicForm, setShowTopicForm] = useState(true);
  const [error, setError] = useState("");
  const [topicSubmitted, setTopicSubmitted] = useState(false);
  const [forceLoading, setForceLoading] = useState(true);
  const [isPartnerNew, setIsPartnerNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Force loading screen for 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Track when partner changes and set animation
  useEffect(() => {
    if (partner) {
      setIsPartnerNew(true);
      const timer = setTimeout(() => {
        setIsPartnerNew(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [partner]);

  // Load user data from session storage
  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    const roomType = sessionStorage.getItem("roomType");

    if (!name) {
      router.push("/");
      return;
    }

    if (roomType !== "change-my-mind") {
      router.push("/choose-room");
      return;
    }

    setUserName(name);
  }, [router]);

  // Join room effect - separated to avoid dependencies issues
  useEffect(() => {
    // Check if we've already joined a room in this session
    const hasJoinedBefore = sessionStorage.getItem("hasJoinedRoom") === "true";
    if (hasJoinedBefore) {
      setHasJoinedRoom(true);
      return;
    }

    if (userName && !hasJoinedRoom && isConnected) {
      console.log("Joining change-my-mind room as:", userName);
      
      // Check if we have a target room ID (from browse page)
      const targetRoomId = sessionStorage.getItem("targetRoomId");
      
      if (targetRoomId) {
        // User is joining an existing room
        console.log(`Joining existing room ${targetRoomId}`);
        joinRoom(userName, "change-my-mind", targetRoomId)
          .then(() => {
            setHasJoinedRoom(true);
            sessionStorage.setItem("hasJoinedRoom", "true");
            // Clear the target room ID
            sessionStorage.removeItem("targetRoomId");
            console.log("Successfully joined existing room");
            
            // Don't show topic form since we're joining an existing room
            setShowTopicForm(false);
            setTopicSubmitted(true);
          })
          .catch((err) => {
            console.error("Error joining room:", err);
          });
      } else {
        // User is creating a new room
        joinRoom(userName, "change-my-mind")
          .then(() => {
            setHasJoinedRoom(true);
            sessionStorage.setItem("hasJoinedRoom", "true");
            console.log("Successfully joined room");
          })
          .catch((err) => {
            console.error("Error joining room:", err);
          });
      }
    }
  }, [userName, hasJoinedRoom, isConnected, joinRoom]);

  // Clear hasJoined when leaving
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      sessionStorage.removeItem("hasJoinedRoom");
    };
  }, []);

  // Show notification when partner joins
  useEffect(() => {
    if (partner) {
      // This would be a good place to add a toast notification library
      // For now, we'll just use the browser's built-in notification if available
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`${partner.name} has joined your debate!`);
      }
    }
  }, [partner]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle timer end
  const handleTimeUp = () => {
    // Handle end of debate
    router.push("/choose-room");
  };

  // Submit custom topic
  const handleSubmitTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setUserTopic(customTopic).then((success) => {
      if (success) {
        setTopicSubmitted(true);
        setShowTopicForm(false);
        setError("");
        
        // Add system message about the topic
        const topicMessage: ChatMessageType = {
          id: crypto.randomUUID(),
          content: `You created a "Change My Mind" room with topic: "${customTopic}"`,
          sender: "System",
          timestamp: new Date(),
          isSystem: true,
        };
        
        // We'll manually add the message to our local state
        const updatedMessages = [...messages, topicMessage];
        // No need to call setMessages as this will automatically be updated by the context
      } else {
        setError("Failed to set topic. Please try again.");
      }
    });
  };

  // For change-my-mind rooms, we don't want to wait for a partner
  const shouldShowLoadingScreen = forceLoading; // Only show loading during the force period

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {shouldShowLoadingScreen ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-indigo-50 to-purple-100">
          <div className="text-center p-8 max-w-md">
            <div className="mb-8">
              <div className="inline-block relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-400 rounded-full opacity-75 animate-pulse"></div>
                <div className="absolute top-2 left-2 w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-purple-700 mb-4">
              Creating Your "Change My Mind" Room
            </h1>
            <p className="text-gray-600 mb-6">
              We're setting up your room. People can join once you've set a topic.
            </p>
            <div className="flex justify-center space-x-2 mb-8">
              <span
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
            <Link href="/choose-room" className="mt-8 inline-block">
              <WiredButton backgroundColor="#9333ea">
                <span className="px-4 py-1 text-sm text-gray-800 font-medium">
                  Cancel and Choose Another Room
                </span>
              </WiredButton>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex-grow">
              <h1 className="text-xl font-semibold text-gray-800 mb-1">
                Change My Mind Room
              </h1>
              
              {partner ? (
                <div className={`transition-all duration-500 ${isPartnerNew ? 'animate-pulse' : ''} bg-green-50 border-l-4 border-green-400 p-2 rounded`}>
                  <p className="text-lg font-medium text-green-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Debating with <span className="font-bold ml-1">{partner.name}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                  <p className="text-lg font-medium text-yellow-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="mr-2">Waiting for someone to change your mind</span>
                    <span className="flex space-x-1">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isTimerRunning && (
                <Timer
                  duration={120}
                  onTimeUp={handleTimeUp}
                  isRunning={isTimerRunning}
                  restartKey={restartKey}
                />
              )}
              
              <Link href="/choose-room">
                <WiredButton backgroundColor="#f3f4f6">
                  <span className="px-4 py-1 text-sm text-gray-800 font-medium">
                    Leave Room
                  </span>
                </WiredButton>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-grow overflow-y-auto p-4 pb-16">
            {/* Topic Form */}
            {showTopicForm && !topicSubmitted && (
              <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Set Your "Change My Mind" Topic
                </h2>
                <p className="text-gray-600 mb-4">
                  This is the topic you want to debate. Other users can join to try and change your mind.
                </p>
                <form onSubmit={handleSubmitTopic} className="space-y-4">
                  <div>
                    <label
                      htmlFor="topic"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Topic
                    </label>
                    <input
                      type="text"
                      id="topic"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g., Pineapple belongs on pizza"
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Set Topic
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Topic Display */}
            {topic && (
              <div className="mb-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <h2 className="text-md font-semibold text-purple-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Current Topic: <span className="font-bold ml-1">"{topic}"</span>
                </h2>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.length === 0 && !showTopicForm && (
                <div className="text-center p-8 text-gray-500">
                  <p className="text-lg">No messages yet.</p>
                  <p className="text-sm">Be the first to start the debate!</p>
                </div>
              )}

              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={
                    currentUser ? message.sender === currentUser.name : false
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200">
            <ChatInput
              onSendMessage={sendMessage}
              disabled={!topicSubmitted}
              placeholder={
                !topicSubmitted
                  ? "Set a topic to start chatting"
                  : !partner
                  ? "Waiting for someone to join..."
                  : "Type your message..."
              }
            />
          </div>
        </>
      )}
    </div>
  );
} 