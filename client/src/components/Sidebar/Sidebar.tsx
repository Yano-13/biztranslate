import { useCallback, useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useCreateThread } from '../../hooks/useCreateThread';
import ThreadList from './ThreadList';

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useStore();
  const createThreadMutation = useCreateThread();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [threadName, setThreadName] = useState('');

  const handleCreateThread = useCallback(() => {
    if (!createThreadMutation.isPending) {
      setShowNameDialog(true);
    }
  }, [createThreadMutation.isPending]);

  const handleConfirmCreate = useCallback(() => {
    const title = threadName.trim() || undefined;
    createThreadMutation.mutate(title);
    setShowNameDialog(false);
    setThreadName('');
  }, [createThreadMutation, threadName]);

  const handleCancelCreate = useCallback(() => {
    setShowNameDialog(false);
    setThreadName('');
  }, []);

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
      >
        <Menu className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">会話</h2>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleCreateThread}
            disabled={createThreadMutation.isPending}
            className="w-full btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>{createThreadMutation.isPending ? '作成中...' : '新しい会話'}</span>
          </button>
        </div>

        {/* スレッド一覧 */}
        <ThreadList />
      </div>

      {/* スレッド名入力ダイアログ */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">新しい会話を作成</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会話名（空欄の場合は日時が設定されます）
              </label>
              <input
                type="text"
                value={threadName}
                onChange={(e) => setThreadName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmCreate();
                  } else if (e.key === 'Escape') {
                    handleCancelCreate();
                  }
                }}
                placeholder="例: 新規プロジェクトについて"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelCreate}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={createThreadMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createThreadMutation.isPending ? '作成中...' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

// Made with Bob
