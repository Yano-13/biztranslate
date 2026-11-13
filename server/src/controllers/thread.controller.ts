import { Request, Response } from 'express';
import {
  findThreads,
  countThreads,
  findThreadById,
  insertThread,
  updateThreadFields,
  deleteThreadById,
} from '../models/Thread';
import { deleteMessagesByThread } from '../models/Message';

/**
 * スレッド一覧を取得
 */
export const getThreads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { archived, platform, limit = 50, skip = 0 } = req.query;

    const filter: { isArchived?: boolean; platform?: string } = {};
    if (archived !== undefined) {
      filter.isArchived = archived === 'true';
    }
    if (platform) {
      filter.platform = platform as string;
    }

    const threads = findThreads(filter, Number(limit), Number(skip));
    const total = countThreads(filter);

    res.json({
      success: true,
      data: threads,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch threads',
    });
  }
};

/**
 * スレッド詳細を取得
 */
export const getThreadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const thread = findThreadById(id);
    if (!thread) {
      res.status(404).json({
        success: false,
        error: 'Thread not found',
      });
      return;
    }

    res.json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch thread',
    });
  }
};

/**
 * 新規スレッドを作成
 */
export const createThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, platform, participants, tags } = req.body;

    if (!platform) {
      res.status(400).json({
        success: false,
        error: 'Platform is required',
      });
      return;
    }

    // タイトルが指定されていない場合、日時をデフォルトとして使用
    const defaultTitle = title || new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const thread = insertThread({
      title: defaultTitle,
      platform,
      participants: participants || [],
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create thread',
    });
  }
};

/**
 * スレッドを更新
 */
export const updateThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, participants, tags, isArchived } = req.body;

    if (!findThreadById(id)) {
      res.status(404).json({
        success: false,
        error: 'Thread not found',
      });
      return;
    }

    const thread = updateThreadFields(id, {
      ...(title && { title }),
      ...(participants && { participants }),
      ...(tags && { tags }),
      ...(isArchived !== undefined && { isArchived }),
    });

    res.json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error('Error updating thread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update thread',
    });
  }
};

/**
 * スレッドを削除
 */
export const deleteThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!deleteThreadById(id)) {
      res.status(404).json({
        success: false,
        error: 'Thread not found',
      });
      return;
    }

    // 関連するメッセージも削除
    deleteMessagesByThread(id);

    res.json({
      success: true,
      message: 'Thread and related messages deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete thread',
    });
  }
};

/**
 * スレッドをアーカイブ/アンアーカイブ
 */
export const toggleArchiveThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const current = findThreadById(id);
    if (!current) {
      res.status(404).json({
        success: false,
        error: 'Thread not found',
      });
      return;
    }

    const thread = updateThreadFields(id, { isArchived: !current.isArchived });

    res.json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error('Error toggling archive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle archive status',
    });
  }
};

// Made with Bob
