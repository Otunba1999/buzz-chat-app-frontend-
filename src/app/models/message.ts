import { User } from "./user";

export interface Message {
  id: number | undefined;
  content: string;
  senderId: string;
  recipientId: string;
  status: string;
  messageType: string;
  chatId: string;
  timestamp: Date;
}