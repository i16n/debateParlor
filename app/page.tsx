"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize Wired Elements on the client side
  useEffect(() => {
    import("wired-elements");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // Store user name in session storage
    sessionStorage.setItem("userName", name.trim());
    router.push("/choose-room");
  };

  const handleButtonClick = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // Store user name in session storage
    sessionStorage.setItem("userName", name.trim());
    router.push("/choose-room");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to The Debate Parlor
          </h1>

          <div className="mt-4 bg-indigo-50 p-4 rounded-lg text-left text-sm">
            <ul className="space-y-2 text-gray-700 list-disc pl-5">
              <li>Choose between randomly assigned or free topic debates</li>
              <li>Debates last 2 minutes</li>
              <li>If you both agree on the topic, the debate is extended!</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <wired-input
              id="name"
              placeholder="Enter your name"
              value={name}
              className="w-full"
              onInput={(e: any) => setName(e.target.value)}
            ></wired-input>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-center">
            <wired-button
              elevation="4"
              className="p-2 text-lg"
              onClick={handleButtonClick}
            >
              Continue
            </wired-button>
          </div>
        </form>
      </div>
    </div>
  );
}
