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

  const handleRoomSelect = (roomType: "change-my-mind" | "assigned-topic" | "browse-rooms") => {
    sessionStorage.setItem("roomType", roomType);

    if (roomType === "change-my-mind") {
      router.push("/chat/change-my-mind");
    } else if (roomType === "assigned-topic") {
      router.push("/chat/assigned-topic");
    } else if (roomType === "browse-rooms") {
      router.push("/browse-rooms");
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

        <div className="mt-8 space-y-4">
          <wired-card
            elevation={2}
            onClick={() => handleRoomSelect("change-my-mind")}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-primary">
              Create a Room - "Change My Mind"-style
            </h2>
            <p className="mt-2 text-gray-600">
              Create your own room and set a topic you want to debate about.
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

          <wired-card
            elevation={2}
            onClick={() => handleRoomSelect("browse-rooms")}
            className="w-full p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-green-600">
              Browse Live "Change My Mind" Rooms
            </h2>
            <p className="mt-2 text-gray-600">
              See all currently active rooms and join the debate that interests you.
            </p>
          </wired-card>
        </div>
      </div>
    </div>
  );
}
