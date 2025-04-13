"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  restartKey?: number; // to force restart timer
}

export default function Timer({
  duration,
  onTimeUp,
  isRunning,
  restartKey = 0,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Reset when restartKey changes
    setTimeLeft(duration);
  }, [duration, restartKey]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeUp, restartKey]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center">
      <div
        className={`text-xl font-bold ${
          timeLeft < 30 ? "text-red-500" : "text-gray-700"
        }`}
      >
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      <div className="text-sm text-gray-500">
        {isRunning ? "Time remaining" : "Timer paused"}
      </div>
    </div>
  );
}
