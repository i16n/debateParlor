"use client";

interface ChatMessageProps {
  message: string;
  sender: string;
  isCurrentUser: boolean;
  timestamp: Date;
  isSystem?: boolean;
  isAgreement?: boolean;
  isTopicChange?: boolean;
}

export default function ChatMessage({
  message,
  sender,
  isCurrentUser,
  timestamp,
  isSystem,
  isAgreement,
  isTopicChange,
}: ChatMessageProps) {
  // Special message styles
  if (isTopicChange) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-indigo-100 border-l-4 border-indigo-500 px-6 py-3 rounded-md max-w-md">
          <p className="text-center font-medium text-indigo-800">{message}</p>
        </div>
      </div>
    );
  }

  if (isAgreement) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-green-100 border border-green-300 px-5 py-2 rounded-full">
          <p className="text-center font-bold text-green-700">{message}</p>
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 px-4 py-1 rounded text-sm text-gray-600 max-w-[80%]">
          <p className="text-center">{message}</p>
        </div>
      </div>
    );
  }

  // Regular user message
  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isCurrentUser
            ? "bg-primary text-white rounded-tr-none"
            : "bg-gray-200 text-gray-800 rounded-tl-none"
        }`}
      >
        <div className="flex justify-between items-baseline mb-1">
          <span
            className={`font-medium text-sm ${
              isCurrentUser ? "text-blue-100" : "text-gray-600"
            }`}
          >
            {sender}
          </span>
          <span
            className={`text-xs ml-2 ${
              isCurrentUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words">{message}</p>
      </div>
    </div>
  );
}
