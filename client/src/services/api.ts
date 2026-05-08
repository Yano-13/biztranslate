import axios from 'axios';
import type {
  Thread,
  Message,
  TranslationRequest,
  TranslationResponse,
  ApiResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // 将来的に認証トークンを追加する場合
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// スレッド関連API
export const threadApi = {
  getAll: async (params?: {
    archived?: boolean;
    platform?: string;
    limit?: number;
    skip?: number;
  }): Promise<ApiResponse<Thread[]>> => {
    const response = await api.get('/threads', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Thread>> => {
    const response = await api.get(`/threads/${id}`);
    return response.data;
  },

  create: async (data: {
    title?: string;
    platform: 'chat' | 'email';
    participants?: string[];
    tags?: string[];
  }): Promise<ApiResponse<Thread>> => {
    const response = await api.post('/threads', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Thread>
  ): Promise<ApiResponse<Thread>> => {
    const response = await api.put(`/threads/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/threads/${id}`);
    return response.data;
  },

  toggleArchive: async (id: string): Promise<ApiResponse<Thread>> => {
    const response = await api.patch(`/threads/${id}/archive`);
    return response.data;
  },
};

// 翻訳関連API
export const translationApi = {
  translate: async (
    data: TranslationRequest
  ): Promise<TranslationResponse> => {
    const response = await api.post('/translations/translate', data);
    return response.data;
  },

  translateReply: async (data: {
    text: string;
    threadId: string;
    platform?: 'chat' | 'email';
    tone?: 'formal' | 'casual';
    targetLang?: string;
  }): Promise<ApiResponse<{
    originalText: string;
    translatedText: string;
    formattedText: string;
    platform: string;
    tone: string;
    message: Message;
  }>> => {
    const response = await api.post('/translations/reply', data);
    return response.data;
  },

  generateSuggestions: async (data: {
    messageId: string;
    platform?: 'chat' | 'email';
    tone?: 'formal' | 'casual';
  }): Promise<ApiResponse<{ suggestions: string[] }>> => {
    const response = await api.post('/translations/suggestions', data);
    return response.data;
  },

  getThreadMessages: async (
    threadId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<ApiResponse<Message[]>> => {
    const response = await api.get(`/translations/threads/${threadId}/messages`, {
      params,
    });
    return response.data;
  },

  createMessage: async (data: {
    threadId: string;
    text: string;
    platform?: 'chat' | 'email';
    direction?: 'incoming' | 'outgoing';
    tone?: 'formal' | 'casual';
    sourceLang?: string;
    targetLang?: string;
  }): Promise<ApiResponse<Message>> => {
    const response = await api.post('/translations/messages', data);
    return response.data;
  },

  getUsage: async (): Promise<ApiResponse<{
    characterCount: number;
    characterLimit: number;
    characterUsagePercent: string;
  }>> => {
    const response = await api.get('/translations/usage');
    return response.data;
  },
};

export default api;

// Made with Bob
