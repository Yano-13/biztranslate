import type { LanguageOption } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export const getLanguageName = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.name : code;
};

export const getLanguageFlag = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.flag : '🌐';
};

// Made with Bob
