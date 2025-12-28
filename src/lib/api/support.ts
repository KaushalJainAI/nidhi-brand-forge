import { API_BASE_URL, authFetch, publicFetch } from "./config";

// Contact Submission types
export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
}

export interface ContactSubmissionCreate {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Chat types
export interface ChatMessage {
  id: number;
  sender_type: 'user' | 'admin' | 'system';
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatSession {
  id: number;
  session_id: string;
  subject: string;
  status: 'open' | 'waiting' | 'resolved' | 'closed';
  priority: string;
  order_number?: string;
  messages: ChatMessage[];
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionCreate {
  order_number?: string;
  subject?: string;
}

// Contact API (public - anyone can submit)
export const contactAPI = {
  submit: async (data: ContactSubmissionCreate): Promise<ContactSubmission> => {
    const response = await publicFetch(`${API_BASE_URL}/contact/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },
};

// Chat Support API (authenticated)
export const chatAPI = {
  // Create a new chat session
  createSession: async (data: ChatSessionCreate): Promise<ChatSession> => {
    const response = await authFetch(`${API_BASE_URL}/chat-sessions/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  // Get a chat session by ID
  getSession: async (sessionId: number): Promise<ChatSession> => {
    const response = await authFetch(`${API_BASE_URL}/chat-sessions/${sessionId}/`);
    return response;
  },

  // Get messages for a session
  getMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    const response = await authFetch(`${API_BASE_URL}/chat-sessions/${sessionId}/messages/`);
    return response;
  },

  // Send a message
  sendMessage: async (sessionId: number, message: string): Promise<ChatMessage> => {
    const response = await authFetch(`${API_BASE_URL}/chat-sessions/${sessionId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return response;
  },

  // Get user's chat sessions
  getMySessions: async (): Promise<ChatSession[]> => {
    const response = await authFetch(`${API_BASE_URL}/chat-sessions/`);
    return response;
  },
};
