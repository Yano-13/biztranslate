import { randomUUID } from 'crypto';
import { getDb } from '../config/database';

export interface IThread {
  _id: string;
  title: string;
  platform: 'chat' | 'email';
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  participants: string[];
  tags: string[];
  isArchived: boolean;
}

interface ThreadRow extends Omit<IThread, 'participants' | 'tags' | 'isArchived'> {
  participants: string;
  tags: string;
  isArchived: number;
}

const toThread = (row: ThreadRow): IThread => ({
  ...row,
  participants: JSON.parse(row.participants),
  tags: JSON.parse(row.tags),
  isArchived: row.isArchived === 1,
});

export interface ThreadFilter {
  isArchived?: boolean;
  platform?: string;
}

const buildWhere = (filter: ThreadFilter): { sql: string; params: unknown[] } => {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filter.isArchived !== undefined) {
    conditions.push('isArchived = ?');
    params.push(filter.isArchived ? 1 : 0);
  }
  if (filter.platform) {
    conditions.push('platform = ?');
    params.push(filter.platform);
  }
  return {
    sql: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

export const findThreads = (filter: ThreadFilter, limit: number, skip: number): IThread[] => {
  const where = buildWhere(filter);
  const rows = getDb()
    .prepare(`SELECT * FROM threads ${where.sql} ORDER BY lastMessageAt DESC LIMIT ? OFFSET ?`)
    .all(...where.params, limit, skip) as ThreadRow[];
  return rows.map(toThread);
};

export const countThreads = (filter: ThreadFilter): number => {
  const where = buildWhere(filter);
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS count FROM threads ${where.sql}`)
    .get(...where.params) as { count: number };
  return row.count;
};

export const findThreadById = (id: string): IThread | undefined => {
  const row = getDb().prepare('SELECT * FROM threads WHERE _id = ?').get(id) as ThreadRow | undefined;
  return row ? toThread(row) : undefined;
};

export const insertThread = (data: {
  title: string;
  platform: string;
  participants: string[];
  tags: string[];
}): IThread => {
  const now = new Date().toISOString();
  const _id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO threads (_id, title, platform, participants, tags, isArchived, lastMessageAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .run(_id, data.title, data.platform, JSON.stringify(data.participants), JSON.stringify(data.tags), now, now, now);
  return findThreadById(_id)!;
};

export const updateThreadFields = (
  id: string,
  fields: { title?: string; participants?: string[]; tags?: string[]; isArchived?: boolean }
): IThread | undefined => {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.title !== undefined) {
    sets.push('title = ?');
    params.push(fields.title);
  }
  if (fields.participants !== undefined) {
    sets.push('participants = ?');
    params.push(JSON.stringify(fields.participants));
  }
  if (fields.tags !== undefined) {
    sets.push('tags = ?');
    params.push(JSON.stringify(fields.tags));
  }
  if (fields.isArchived !== undefined) {
    sets.push('isArchived = ?');
    params.push(fields.isArchived ? 1 : 0);
  }
  sets.push('updatedAt = ?');
  params.push(new Date().toISOString());

  getDb()
    .prepare(`UPDATE threads SET ${sets.join(', ')} WHERE _id = ?`)
    .run(...params, id);
  return findThreadById(id);
};

export const deleteThreadById = (id: string): boolean => {
  const result = getDb().prepare('DELETE FROM threads WHERE _id = ?').run(id);
  return result.changes > 0;
};

export const touchThread = (id: string): void => {
  const now = new Date().toISOString();
  getDb()
    .prepare('UPDATE threads SET lastMessageAt = ?, updatedAt = ? WHERE _id = ?')
    .run(now, now, id);
};

// Made with Bob
