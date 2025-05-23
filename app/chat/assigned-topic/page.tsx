"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChatContext } from "../../contexts/ChatContext";
import ChatMessage from "../../components/ChatMessage";
import ChatInput from "../../components/ChatInput";
import Timer from "../../components/Timer";
import WiredButton from "../../components/WiredButton";

export default function AssignedTopicChat() {
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
    isUserAgreed,
    toggleAgree,
    isPartnerAgreed,
    restartKey,
    joinRoom,
  } = useChatContext();

  const [userName, setUserName] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [forceLoading, setForceLoading] = useState(true);
  const [isPartnerNew, setIsPartnerNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

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

    if (roomType !== "assigned-topic") {
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
      console.log("Joining assigned-topic room as:", userName);
      joinRoom(userName, "assigned-topic")
        .then(() => {
          setHasJoinedRoom(true);
          sessionStorage.setItem("hasJoinedRoom", "true");
          console.log("Successfully joined room");
        })
        .catch((err) => {
          console.error("Error joining room:", err);
        });
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

  // Agreement handling
  const handleToggleAgree = () => {
    toggleAgree();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {isWaiting || forceLoading ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
          <div className="text-center p-8 max-w-md">
            <div className="mb-8">
              <div className="inline-block relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-400 rounded-full opacity-75 animate-pulse"></div>
                <div className="absolute top-2 left-2 w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  {isClient && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-indigo-700 mb-4">
              Finding a Debate Partner
            </h1>
            <p className="text-gray-600 mb-6">
              We're finding someone for you to debate your assigned topic with.
              This shouldn't take long!
            </p>
            <div className="flex justify-center space-x-2 mb-8">
              <span
                className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
            <Link href="/choose-room" className="mt-8 inline-block">
              <WiredButton backgroundColor="#4f46e5">
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
                Debate {topic}!
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
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-2 rounded">
                  <p className="text-lg font-medium text-indigo-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="mr-2">Waiting for a partner</span>
                    <span className="flex space-x-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
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

              <Link
                href="/choose-room"
                className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                Exit Chat
              </Link>
            </div>
          </header>

          {/* Topic section */}
          <div className="bg-gray-100 p-3">
            {topic ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    <span className="text-gray-500">Current Topic:</span>{" "}
                    {topic}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={isUserAgreed}
                      onChange={handleToggleAgree}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="agree"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      We agree
                    </label>
                  </div>
                  {isPartnerAgreed && (
                    <span className="text-green-600 text-sm">
                      Your partner agreed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-600">Loading topic...</p>
              </div>
            )}
          </div>

          {/* Chat messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.content}
                sender={msg.sender}
                isCurrentUser={
                  currentUser ? msg.sender === currentUser.name : false
                }
                timestamp={new Date(msg.timestamp)}
                isSystem={msg.isSystem}
                isAgreement={msg.isAgreement}
                isTopicChange={msg.isTopicChange}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-4 bg-white border-t">
            <ChatInput
              onSendMessage={sendMessage}
              disabled={!isConnected || !isTimerRunning}
            />
          </div>
        </>
      )}
    </div>
  );
}
