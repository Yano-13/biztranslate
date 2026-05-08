import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { threadApi, translationApi } from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/Chat/ChatArea';
import { MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { currentThread, setCurrentThread, threads, setThreads, setMessages } = useStore();

  // スレッド一覧を取得
  const { data: threadsData } = useQuery({
    queryKey: ['threads'],
    queryFn: () => threadApi.getAll(),
  });

  // 現在のスレッドのメッセージを取得
  const { data: messagesData } = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => translationApi.getThreadMessages(threadId!),
    enabled: !!threadId,
  });

  useEffect(() => {
    if (threadsData?.data) {
      setThreads(threadsData.data);
    }
  }, [threadsData, setThreads]);

  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data);
    }
  }, [messagesData, setMessages]);

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const thread = threads.find((t) => t._id === threadId);
      if (thread) {
        setCurrentThread(thread);
      }
    }
  }, [threadId, threads, setCurrentThread]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">BizTranslate</h1>
            </div>
            {currentThread && (
              <h2 className="text-lg font-semibold text-gray-800">
                {currentThread.title}
              </h2>
            )}
          </div>
        </header>

        {/* チャットエリア */}
        {currentThread ? (
          <ChatArea />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                会話を選択してください
              </h3>
              <p className="text-gray-500">
                左のサイドバーから会話を選択するか、新しい会話を開始してください
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

// Made with Bob
