import { Router } from 'express';
import {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  toggleArchiveThread,
} from '../controllers/thread.controller';

const router = Router();

// GET /api/threads - スレッド一覧取得
router.get('/', getThreads);

// GET /api/threads/:id - スレッド詳細取得
router.get('/:id', getThreadById);

// POST /api/threads - 新規スレッド作成
router.post('/', createThread);

// PUT /api/threads/:id - スレッド更新
router.put('/:id', updateThread);

// DELETE /api/threads/:id - スレッド削除
router.delete('/:id', deleteThread);

// PATCH /api/threads/:id/archive - アーカイブ切り替え
router.patch('/:id/archive', toggleArchiveThread);

export default router;

// Made with Bob
