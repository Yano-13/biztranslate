export interface Thread {
  _id: string;
  title: string;
  platform: 'chat' | 'email';
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  participants: string[];
  tags: string[];
  isArchived: boolean;
}

export interface Message {
  _id: string;
  threadId: string;
  direction: 'incoming' | 'outgoing';
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  targetLanguage: string;
  platform: 'chat' | 'email';
  formattedText?: string;
  suggestions?: string[];
  createdAt: string;
  metadata: {
    tone?: 'formal' | 'casual';
    confidence?: number;
  };
}

export interface TranslationRequest {
  text: string;
  targetLang?: string;
  sourceLang?: string;
  threadId?: string;
  platform?: 'chat' | 'email';
  tone?: 'formal' | 'casual';
}

export interface TranslationResponse {
  success: boolean;
  data: {
    originalText: string;
    translatedText: string;
    detectedSourceLang: string;
    targetLang: string;
    message?: Message;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    skip: number;
  };
}

export type Tone = 'formal' | 'casual';
export type Platform = 'chat' | 'email';
export type Direction = 'incoming' | 'outgoing';
export type Language = 'ja' | 'en' | 'zh' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

// Made with Bob
