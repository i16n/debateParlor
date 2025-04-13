"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "wired-elements";

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

export default function ChooseRoom() {
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user has entered a name
    const name = sessionStorage.getItem("userName");
    if (!name) {
      router.push("/");
      return;
    }
    setUserName(name);
  }, [router]);

  const handleRoomSelect = (roomType: "free-topic" | "assigned-topic") => {
    sessionStorage.setItem("roomType", roomType);

    if (roomType === "free-topic") {
      router.push("/chat/free-topic");
    } else {
      router.push("/chat/assigned-topic");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg relative">
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="text-gray-700 hover:text-gray-900 text-4xl font-bold"
            aria-label="Back to home"
          >
            ←
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Choose Your Debate Room
          </h1>
        </div>

        <div className="mt-8 space-y-4">
          <wired-card
            elevation={2}
            onClick={() => handleRoomSelect("free-topic")}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-primary">
              Argue About Anything
            </h2>
            <p className="mt-2 text-gray-600">
              Join a chat room with a random person and state your own topic for
              debate.
            </p>
          </wired-card>

          <wired-card
            elevation={2}
            onClick={() => handleRoomSelect("assigned-topic")}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-secondary">
              Debate a Preassigned Topic
            </h2>
            <p className="mt-2 text-gray-600">
              Get matched with a random person and debate a randomly assigned
              topic.
            </p>
          </wired-card>
        </div>
      </div>
    </div>
  );
}
