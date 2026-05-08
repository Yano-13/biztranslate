import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MessageSquare, Mail, Edit2, Check, X, Trash2 } from 'lucide-react';
import { threadApi } from '../../services/api';

const ThreadList = () => {
  const navigate = useNavigate();
  const { threads, currentThread, updateThread, removeThread } = useStore();
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const handleThreadClick = (threadId: string) => {
    navigate(`/thread/${threadId}`);
  };

  const handleStartEdit = useCallback((e: React.MouseEvent, threadId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  }, []);

  const handleSaveEdit = useCallback(async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      return;
    }
    
    try {
      const response = await threadApi.update(threadId, { title: editingTitle.trim() });
      if (response.data) {
        updateThread(threadId, { title: editingTitle.trim() });
      }
      setEditingThreadId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update thread title:', error);
      alert('スレッド名の更新に失敗しました');
    }
  }, [editingTitle, updateThread]);

  const handleCancelEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(null);
    setEditingTitle('');
  }, []);

  const handleDeleteThread = useCallback(async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    
    if (!window.confirm('このスレッドを削除してもよろしいですか？関連するメッセージも全て削除されます。')) {
      return;
    }

    setDeletingThreadId(threadId);
    
    try {
      await threadApi.delete(threadId);
      removeThread(threadId);
      
      // 削除したスレッドが現在選択中の場合、ホームに戻る
      if (currentThread?._id === threadId) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
      alert('スレッドの削除に失敗しました');
    } finally {
      setDeletingThreadId(null);
    }
  }, [removeThread, currentThread, navigate]);

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm text-center">
          まだ会話がありません
          <br />
          新しい会話を開始してください
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.map((thread) => (
        <div
          key={thread._id}
          onClick={() => handleThreadClick(thread._id)}
          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            currentThread?._id === thread._id ? 'bg-primary-50' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {thread.platform === 'chat' ? (
                <MessageSquare className="w-5 h-5 text-gray-600" />
              ) : (
                <Mail className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editingThreadId === thread._id ? (
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(e as any, thread._id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit(e as any);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={(e) => handleSaveEdit(e, thread._id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="保存"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="キャンセル"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">
                    {thread.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleStartEdit(e, thread._id, thread.title)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-opacity"
                      title="名前を編集"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteThread(e, thread._id)}
                      disabled={deletingThreadId === thread._id}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
              {thread.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {thread.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreadList;

// Made with Bob
