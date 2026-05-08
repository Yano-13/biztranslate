import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { Copy } from 'lucide-react';

const MessageList = () => {
  const { messages } = useStore();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">メッセージがありません</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message._id} className="space-y-3">
            {message.direction === 'incoming' ? (
              // 受信メッセージ: 翻訳（左）→ 原文（右）
              <>
                {/* 翻訳結果の吹き出し（左側） */}
                {message.translatedText && (
                  <div className="flex justify-start">
                    <div className="max-w-2xl bg-gray-100 text-gray-900 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">翻訳</span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.translatedText}</p>
                    </div>
                  </div>
                )}

                {/* 原文の吹き出し（右側） */}
                <div className="flex justify-end">
                  <div className="max-w-2xl bg-blue-600 text-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-100">
                        受信 • {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.originalText}</p>
                  </div>
                </div>

                {/* 返信提案 */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex justify-end">
                    <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        💡 返信提案
                      </p>
                      <div className="space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // 送信メッセージ: 原文（右）→ 翻訳（左）
              <>
                {/* 原文の吹き出し（右側） */}
                <div className="flex justify-end">
                  <div className="max-w-2xl bg-blue-600 text-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-100">
                        送信 • {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.originalText}</p>
                  </div>
                </div>

                {/* 翻訳結果の吹き出し（左側） */}
                {message.translatedText && (
                  <div className="flex justify-start">
                    <div className="max-w-2xl bg-gray-100 text-gray-900 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">翻訳</span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.translatedText}</p>

                      {/* フォーマット済みテキスト */}
                      {message.formattedText && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-700">
                              {message.platform === 'chat' ? 'チャット' : 'Email'}形式
                            </p>
                            <button
                              onClick={() => copyToClipboard(message.formattedText!)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="コピー"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-gray-700">
                            {message.formattedText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;

// Made with Bob
