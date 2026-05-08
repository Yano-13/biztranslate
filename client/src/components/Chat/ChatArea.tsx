import { useStore } from '../../store/useStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatArea = () => {
  const { currentThread } = useStore();

  if (!currentThread) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* メッセージ一覧 */}
      <MessageList />

      {/* メッセージ入力 */}
      <MessageInput />
    </div>
  );
};

export default ChatArea;

// Made with Bob
