import { Message } from "./message";
import { User } from "./user";

export interface Chat {
  lastMessage: Message;
  chatType: string;
  unReadMessages: number;
  user: User;
}