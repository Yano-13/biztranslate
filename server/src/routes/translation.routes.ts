import { Router } from 'express';
import {
  translateText,
  translateReply,
  generateSuggestions,
  getThreadMessages,
  createMessage,
  getUsage,
} from '../controllers/translation.controller';

const router = Router();

// POST /api/translations/translate - テキスト翻訳
router.post('/translate', translateText);

// POST /api/translations/reply - 返信翻訳とフォーマット
router.post('/reply', translateReply);

// POST /api/translations/suggestions - 返信提案生成
router.post('/suggestions', generateSuggestions);

// GET /api/translations/threads/:threadId/messages - スレッドのメッセージ一覧
router.get('/threads/:threadId/messages', getThreadMessages);

// POST /api/translations/messages - 新規メッセージ作成（翻訳付き）
router.post('/messages', createMessage);

// GET /api/translations/usage - DeepL API使用状況
router.get('/usage', getUsage);

export default router;

// Made with Bob
