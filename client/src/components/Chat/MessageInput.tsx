import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { translationApi } from '../../services/api';
import { Send, ArrowLeftRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/languages';

const MessageInput = () => {
  const [inputText, setInputText] = useState('');
  const {
    currentThread,
    selectedPlatform,
    selectedTone,
    sourceLang,
    targetLang,
    setSelectedPlatform,
    setSelectedTone,
    setSourceLang,
    setTargetLang,
    swapLanguages,
    addMessage,
  } = useStore();

  const translateMutation = useMutation({
    mutationFn: translationApi.createMessage,
    onSuccess: (response) => {
      if (response.data) {
        addMessage(response.data);
        setInputText('');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentThread) return;

    translateMutation.mutate({
      threadId: currentThread._id,
      text: inputText,
      platform: selectedPlatform,
      direction: 'outgoing',
      tone: selectedTone,
      sourceLang,
      targetLang,
    });
  };

  const sourceLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);
  const targetLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 設定 */}
        <div className="flex items-center flex-wrap gap-3">
          {/* 言語選択 */}
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={swapLanguages}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="言語を入れ替え"
            >
              <ArrowLeftRight className="w-4 h-4 text-gray-600" />
            </button>
            
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* プラットフォーム */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">プラットフォーム:</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="chat">チャット</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* トーン */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">トーン:</label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="formal">フォーマル</option>
              <option value="casual">カジュアル</option>
            </select>
          </div>
        </div>

        {/* 入力エリア */}
        <div className="flex items-end space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${sourceLangInfo?.name || '言語'}でメッセージを入力...`}
            className="flex-1 input resize-none"
            rows={3}
            disabled={translateMutation.isPending}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || translateMutation.isPending}
            className="btn btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {translateMutation.isPending ? (
              <span>送信中...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;

// Made with Bob
