import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { threadApi } from '../services/api';

export const useCreateThread = () => {
  const navigate = useNavigate();
  const { selectedPlatform, addThread, setCurrentThread } = useStore();

  return useMutation({
    mutationFn: (title?: string) =>
      threadApi.create({
        title,
        platform: selectedPlatform,
      }),
    onSuccess: (response) => {
      if (!response.data) return;
      addThread(response.data);
      setCurrentThread(response.data);
      navigate(`/thread/${response.data._id}`);
    },
    onError: (error) => {
      console.error('Failed to create thread:', error);
      window.alert('新しい会話の作成に失敗しました。サーバー起動とAPI接続を確認してください。');
    },
  });
};

// Made with Bob