import { create } from 'zustand';
import type { Thread, Message, Platform, Tone, Language } from '../types';

interface AppState {
  // スレッド関連
  threads: Thread[];
  currentThread: Thread | null;
  setThreads: (threads: Thread[]) => void;
  setCurrentThread: (thread: Thread | null) => void;
  addThread: (thread: Thread) => void;
  updateThread: (id: string, updates: Partial<Thread>) => void;
  removeThread: (id: string) => void;

  // メッセージ関連
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // UI状態
  selectedPlatform: Platform;
  selectedTone: Tone;
  sourceLang: Language;
  targetLang: Language;
  setSelectedPlatform: (platform: Platform) => void;
  setSelectedTone: (tone: Tone) => void;
  setSourceLang: (lang: Language) => void;
  setTargetLang: (lang: Language) => void;
  swapLanguages: () => void;

  // ローディング状態
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // エラー状態
  error: string | null;
  setError: (error: string | null) => void;

  // サイドバー状態
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  // スレッド関連の初期値
  threads: [],
  currentThread: null,
  setThreads: (threads) => set({ threads }),
  setCurrentThread: (thread) => set({ currentThread: thread }),
  addThread: (thread) =>
    set((state) => ({ threads: [thread, ...state.threads] })),
  updateThread: (id, updates) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t._id === id ? { ...t, ...updates } : t
      ),
      currentThread:
        state.currentThread?._id === id
          ? { ...state.currentThread, ...updates }
          : state.currentThread,
    })),
  removeThread: (id) =>
    set((state) => ({
      threads: state.threads.filter((t) => t._id !== id),
      currentThread:
        state.currentThread?._id === id ? null : state.currentThread,
    })),

  // メッセージ関連の初期値
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  // UI状態の初期値
  selectedPlatform: 'chat',
  selectedTone: 'formal',
  sourceLang: 'en',
  targetLang: 'ja',
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setSourceLang: (lang) => set({ sourceLang: lang }),
  setTargetLang: (lang) => set({ targetLang: lang }),
  swapLanguages: () =>
    set((state) => ({
      sourceLang: state.targetLang,
      targetLang: state.sourceLang,
    })),

  // ローディング状態の初期値
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // エラー状態の初期値
  error: null,
  setError: (error) => set({ error }),

  // サイドバー状態の初期値
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

// Made with Bob
