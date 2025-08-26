// types/socket.ts
export interface ServerToClientEvents {
    message: (data: MessageData) => void;
    'user-joined': (userId: string) => void;
    'room-message': (data: MessageData) => void;
  }
  
  export interface ClientToServerEvents {
    message: (data: MessageData) => void;
    'join-room': (room: string) => void;
    'room-message': (data: { room: string; message: MessageData }) => void;
  }
  
  export interface MessageData {
    text: string;
    timestamp: string;
    id: string;
    userId?: string;
  }
  
  export interface InterServerEvents {}
  
  export interface SocketData {
    userId?: string;
    rooms?: string[];
  }