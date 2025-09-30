export interface ChatSession {
  id: string;
  customer_id: string | null;
  agent_id: string | null;
  status: string | null;
  created_at: string;
  closed_at: string | null;
  anonymous_id: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  message: string;
  is_bot: boolean;
  created_at: string;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender_type: 'bot' | 'user';
}
