import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'biztranslate.db');

let db: Database.Database | null = null;

export const getDb = (): Database.Database => {
  if (!db) {
    throw new Error('Database is not connected');
  }
  return db;
};

export const connectDatabase = async (): Promise<void> => {
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        _id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        platform TEXT NOT NULL CHECK (platform IN ('chat', 'email')),
        participants TEXT NOT NULL DEFAULT '[]',
        tags TEXT NOT NULL DEFAULT '[]',
        isArchived INTEGER NOT NULL DEFAULT 0,
        lastMessageAt TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        _id TEXT PRIMARY KEY,
        threadId TEXT NOT NULL REFERENCES threads(_id) ON DELETE CASCADE,
        direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
        originalText TEXT NOT NULL,
        originalLanguage TEXT NOT NULL,
        translatedText TEXT NOT NULL,
        targetLanguage TEXT NOT NULL,
        platform TEXT NOT NULL CHECK (platform IN ('chat', 'email')),
        formattedText TEXT,
        suggestions TEXT NOT NULL DEFAULT '[]',
        metadata TEXT NOT NULL DEFAULT '{}',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_threads_lastMessageAt ON threads(lastMessageAt);
      CREATE INDEX IF NOT EXISTS idx_threads_platform ON threads(platform);
      CREATE INDEX IF NOT EXISTS idx_threads_isArchived ON threads(isArchived);
      CREATE INDEX IF NOT EXISTS idx_messages_thread_createdAt ON messages(threadId, createdAt);
      CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
    `);

    console.log('✅ SQLite connected successfully:', dbPath);
  } catch (error) {
    console.error('❌ Failed to connect to SQLite:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    db?.close();
    db = null;
    console.log('✅ SQLite disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from SQLite:', error);
  }
};

// Made with Bob
