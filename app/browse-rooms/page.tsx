"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "wired-elements";
import { Room } from "../lib/types";
import io from "socket.io-client";

// Add TypeScript declarations for wired-elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wired-card": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          elevation?: number;
        },
        HTMLElement
      >;
    }
  }
}

export default function BrowseRooms() {
  const [userName, setUserName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user has entered a name
    const name = sessionStorage.getItem("userName");
    if (!name) {
      router.push("/");
      return;
    }
    setUserName(name);

    // Connect to socket server
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");
    
    socket.on("connect", () => {
      // Request active rooms
      socket.emit("getActiveRooms", (activeRooms: Room[]) => {
        // Filter only "change-my-mind" rooms
        const changeMyMindRooms = activeRooms.filter(
          (room) => room.type === "change-my-mind" && room.topic
        );
        setRooms(changeMyMindRooms);
        setLoading(false);
      });
    });

    // Listen for room updates
    socket.on("roomsUpdated", (updatedRooms: Room[]) => {
      const changeMyMindRooms = updatedRooms.filter(
        (room) => room.type === "change-my-mind" && room.topic
      );
      setRooms(changeMyMindRooms);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleJoinRoom = (roomId: string) => {
    // Store the room ID in session storage
    sessionStorage.setItem("targetRoomId", roomId);
    sessionStorage.setItem("roomType", "change-my-mind");
    
    // Navigate to the change-my-mind chat page
    router.push("/chat/change-my-mind");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-lg shadow-lg relative">
        <div className="absolute top-4 left-4">
          <Link
            href="/choose-room"
            className="text-gray-700 hover:text-gray-900 text-4xl font-bold"
            aria-label="Back to room selection"
          >
            ←
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mt-6 text-purple-800">
          Browse "Change My Mind" Rooms
        </h1>
        
        <p className="text-center text-gray-600">
          Join a room and try to change someone's mind on a topic they've chosen.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No active rooms found
            </h2>
            <p className="text-gray-500 mb-6">
              Be the first to create a "Change My Mind" room!
            </p>
            <Link href="/choose-room" className="inline-block">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Create a Room
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {rooms.map((room) => (
              <wired-card
                key={room.id}
                elevation={2}
                onClick={() => handleJoinRoom(room.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-purple-800">
                      {room.topic}
                    </h2>
                    <p className="mt-2 text-gray-600">
                      Created by: <span className="font-medium">{room.users[0]?.name}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {room.users.length === 1
                        ? "No one has joined yet - be the first!"
                        : `${room.users.length} people in this debate`}
                    </p>
                  </div>
                  <div className="bg-purple-100 px-3 py-1 rounded-full text-purple-800 text-sm font-medium">
                    Join
                  </div>
                </div>
              </wired-card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 