import { randomUUID } from 'crypto';
import { getDb } from '../config/database';

export interface IMessage {
  _id: string;
  threadId: string;
  direction: 'incoming' | 'outgoing';
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  targetLanguage: string;
  platform: 'chat' | 'email';
  formattedText?: string | null;
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    tone?: 'formal' | 'casual';
    confidence?: number;
  };
}

interface MessageRow extends Omit<IMessage, 'suggestions' | 'metadata'> {
  suggestions: string;
  metadata: string;
}

const toMessage = (row: MessageRow): IMessage => ({
  ...row,
  formattedText: row.formattedText ?? undefined,
  suggestions: JSON.parse(row.suggestions),
  metadata: JSON.parse(row.metadata),
});

export type NewMessage = Omit<IMessage, '_id' | 'createdAt' | 'updatedAt' | 'suggestions' | 'metadata'> & {
  suggestions?: string[];
  metadata?: IMessage['metadata'];
};

export const findMessagesByThread = (threadId: string, limit: number, skip: number): IMessage[] => {
  const rows = getDb()
    .prepare('SELECT * FROM messages WHERE threadId = ? ORDER BY createdAt ASC LIMIT ? OFFSET ?')
    .all(threadId, limit, skip) as MessageRow[];
  return rows.map(toMessage);
};

export const countMessagesByThread = (threadId: string): number => {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS count FROM messages WHERE threadId = ?')
    .get(threadId) as { count: number };
  return row.count;
};

export const findMessageById = (id: string): IMessage | undefined => {
  const row = getDb().prepare('SELECT * FROM messages WHERE _id = ?').get(id) as MessageRow | undefined;
  return row ? toMessage(row) : undefined;
};

export const insertMessage = (data: NewMessage): IMessage => {
  const now = new Date().toISOString();
  const _id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO messages (_id, threadId, direction, originalText, originalLanguage, translatedText,
         targetLanguage, platform, formattedText, suggestions, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      _id,
      data.threadId,
      data.direction,
      data.originalText,
      data.originalLanguage,
      data.translatedText,
      data.targetLanguage,
      data.platform,
      data.formattedText ?? null,
      JSON.stringify(data.suggestions ?? []),
      JSON.stringify(data.metadata ?? {}),
      now,
      now
    );
  return findMessageById(_id)!;
};

export const updateMessageSuggestions = (id: string, suggestions: string[]): IMessage | undefined => {
  getDb()
    .prepare('UPDATE messages SET suggestions = ?, updatedAt = ? WHERE _id = ?')
    .run(JSON.stringify(suggestions), new Date().toISOString(), id);
  return findMessageById(id);
};

export const deleteMessagesByThread = (threadId: string): void => {
  getDb().prepare('DELETE FROM messages WHERE threadId = ?').run(threadId);
};

// Made with Bob
