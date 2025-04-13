export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isSystem?: boolean;
  isAgreement?: boolean;
  isTopicChange?: boolean;
}

export interface User {
  id: string;
  name: string;
  roomId?: string;
}

export interface Room {
  id: string;
  type: "free-topic" | "assigned-topic";
  users: User[];
  messages: ChatMessage[];
  topic?: string;
  userAgreed: Record<string, boolean>;
  startTime: Date;
  isActive: boolean;
}

export interface ServerToClientEvents {
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  message: (message: ChatMessage) => void;
  topicChanged: (newTopic: string) => void;
  timerReset: () => void;
  roomClosed: () => void;
}

export interface ClientToServerEvents {
  joinRoom: (
    user: { name: string },
    roomType: "free-topic" | "assigned-topic",
    callback: (room: Room) => void
  ) => void;
  sendMessage: (
    content: string,
    callback: (delivered: boolean) => void
  ) => void;
  setTopic: (topic: string, callback: (success: boolean) => void) => void;
  agreeOnTopic: (
    agreed: boolean,
    callback: (success: boolean, allAgreed: boolean) => void
  ) => void;
  leaveRoom: () => void;
}
