import { API_BASE_URL, authFetch, authFetchForm } from "./config";

export interface ProposedAction {
  type: "add_to_cart" | "checkout" | "navigate" | "escalate_to_human";
  label: string;
  route?: string;
  product_id?: number;
  item_type?: "product" | "combo";
  quantity?: number;
  reason?: string;
}

export interface AssistantReply {
  conversation_id: string;
  reply: string;
  proposed_action: ProposedAction | null;
  sources?: { tool: string; args: Record<string, unknown> }[];
}

export interface ConversationSummary {
  conversation_id: string;
  title: string;
  status: "active" | "resolved" | "archived";
  needs_human: boolean;
  last_message: string;
  user_email: string | null;
  updated_at: string;
  created_at: string;
}

export interface TranscriptResult {
  transcript: string;
  language: string;
}

export interface ChatMessage {
  id: number;
  // Mirrors the backend ChatMessage.ROLE_CHOICES.
  role: "user" | "assistant" | "tool" | "system" | "admin";
  content: string;
  sender_name: string;
  created_at: string;
}

const ANON_KEY = "assistant_anon_session";
const getAnonSession = (): string => {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`).slice(0, 64);
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
};

export const assistantAPI = {
  chat: async (
    message: string,
    conversationId?: string | null,
    language?: string
  ): Promise<AssistantReply> => {
    return authFetch(`${API_BASE_URL}/assistant/chat/`, {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId || undefined,
        anon_session: getAnonSession(),
        language: language || undefined,
      }),
    });
  },

  listConversations: async (): Promise<ConversationSummary[]> => {
    return authFetch(`${API_BASE_URL}/assistant/conversations/`);
  },

  createConversation: async (): Promise<ConversationSummary> => {
    return authFetch(`${API_BASE_URL}/assistant/conversations/`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    return authFetch(`${API_BASE_URL}/assistant/conversations/${conversationId}/messages/`);
  },

  // Upload recorded audio (16 kHz mono WAV) for self-hosted transcription.
  transcribe: async (audio: Blob, language?: string): Promise<TranscriptResult> => {
    const form = new FormData();
    form.append("audio", audio, "voice.wav");
    if (language && language !== "auto") form.append("language", language);
    return authFetchForm(`${API_BASE_URL}/assistant/transcribe/`, form);
  },
};
