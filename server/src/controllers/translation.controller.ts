import { Request, Response } from 'express';
import Thread from '../models/Thread';
import Message from '../models/Message';
import deeplService from '../services/deepl.service';
import formatterService from '../services/formatter.service';
import suggestionService from '../services/suggestion.service';

/**
 * テキストを翻訳
 */
export const translateText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLang = 'ja', sourceLang, threadId, platform, tone } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        error: 'Text is required',
      });
      return;
    }

    // 翻訳実行
    const translation = await deeplService.translate(text, targetLang, sourceLang);

    // スレッドIDが指定されている場合はメッセージとして保存
    let savedMessage = null;
    if (threadId) {
      const message = new Message({
        threadId,
        direction: 'incoming',
        originalText: text,
        originalLanguage: translation.detectedSourceLang,
        translatedText: translation.translatedText,
        targetLanguage: targetLang,
        platform: platform || 'chat',
        metadata: {
          tone: tone || 'formal',
        },
      });

      savedMessage = await message.save();

      // スレッドの最終メッセージ日時を更新
      await Thread.findByIdAndUpdate(threadId, {
        lastMessageAt: new Date(),
      });
    }

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translation.translatedText,
        detectedSourceLang: translation.detectedSourceLang,
        targetLang,
        message: savedMessage,
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
    });
  }
};

/**
 * 返信を翻訳してフォーマット
 */
export const translateReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      threadId,
      platform = 'chat',
      tone = 'formal',
      targetLang = 'en-US',
    } = req.body;

    if (!text || !threadId) {
      res.status(400).json({
        success: false,
        error: 'Text and threadId are required',
      });
      return;
    }

    // 翻訳実行
    const translation = await deeplService.translate(text, targetLang, 'ja');

    // プラットフォーム形式に変換
    let formattedText: string;
    if (platform === 'chat') {
      formattedText = formatterService.formatForSlack(translation.translatedText, tone);
    } else {
      formattedText = formatterService.formatForEmail(translation.translatedText, tone);
    }

    // メッセージとして保存
    const message = new Message({
      threadId,
      direction: 'outgoing',
      originalText: text,
      originalLanguage: 'ja',
      translatedText: translation.translatedText,
      targetLanguage: targetLang,
      platform,
      formattedText,
      metadata: {
        tone,
      },
    });

    await message.save();

    // スレッドの最終メッセージ日時を更新
    await Thread.findByIdAndUpdate(threadId, {
      lastMessageAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translation.translatedText,
        formattedText,
        platform,
        tone,
        message,
      },
    });
  } catch (error) {
    console.error('Reply translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Reply translation failed',
    });
  }
};

/**
 * 返信提案を生成
 */
export const generateSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId, platform = 'chat', tone = 'formal' } = req.body;

    if (!messageId) {
      res.status(400).json({
        success: false,
        error: 'MessageId is required',
      });
      return;
    }

    // メッセージを取得
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({
        success: false,
        error: 'Message not found',
      });
      return;
    }

    // 返信提案を生成
    const suggestions = await suggestionService.generateSuggestions(
      message.originalText,
      platform,
      tone
    );

    // メッセージに提案を保存
    message.suggestions = suggestions;
    await message.save();

    res.json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error) {
    console.error('Suggestion generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions',
    });
  }
};

/**
 * スレッドのメッセージ一覧を取得
 */
export const getThreadMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ threadId })
      .sort({ createdAt: 1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Message.countDocuments({ threadId });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
};

/**
 * 新規メッセージを作成（翻訳付き）
 */
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      threadId,
      text,
      platform = 'chat',
      direction = 'incoming',
      tone = 'formal',
      sourceLang,
      targetLang,
    } = req.body;

    if (!threadId || !text) {
      res.status(400).json({
        success: false,
        error: 'ThreadId and text are required',
      });
      return;
    }

    // スレッドの存在確認
    const thread = await Thread.findById(threadId);
    if (!thread) {
      res.status(404).json({
        success: false,
        error: 'Thread not found',
      });
      return;
    }

    // 翻訳実行（言語が指定されていない場合はデフォルト値を使用）
    const source = sourceLang || (direction === 'incoming' ? 'en' : 'ja');
    const target = targetLang || (direction === 'incoming' ? 'ja' : 'en-US');
    const translation = await deeplService.translate(text, target, source);

    // 返信提案を生成（受信メッセージの場合）
    let suggestions: string[] = [];
    if (direction === 'incoming') {
      suggestions = await suggestionService.generateSuggestions(text, platform, tone);
    }

    // フォーマット済みテキストを生成（送信メッセージの場合）
    let formattedText: string | undefined;
    if (direction === 'outgoing') {
      if (platform === 'chat') {
        // チャット形式: シンプルなフォーマット
        formattedText = translation.translatedText;
      } else {
        // Email形式: 丁寧な挨拶を追加
        formattedText = `${translation.translatedText}\n\nBest regards,`;
      }
    }

    // メッセージを保存
    const message = new Message({
      threadId,
      direction,
      originalText: text,
      originalLanguage: translation.detectedSourceLang,
      translatedText: translation.translatedText,
      targetLanguage: target,
      platform,
      formattedText,
      suggestions,
      metadata: {
        tone,
      },
    });

    await message.save();

    // スレッドの最終メッセージ日時を更新
    thread.lastMessageAt = new Date();
    await thread.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create message',
    });
  }
};

/**
 * DeepL API使用状況を取得
 */
export const getUsage = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usage = await deeplService.getUsage();

    res.json({
      success: true,
      data: {
        characterCount: usage.character?.count || 0,
        characterLimit: usage.character?.limit || 0,
        characterUsagePercent: usage.character
          ? ((usage.character.count / usage.character.limit) * 100).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage information',
    });
  }
};

// Made with Bob
