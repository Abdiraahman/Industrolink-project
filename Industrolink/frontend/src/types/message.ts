import { type BaseEntity } from './common';

export interface Conversation extends BaseEntity {
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
}

export interface Message extends BaseEntity {
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface MessageState {
  selectedConversation: number | null;
  newMessage: string;
}