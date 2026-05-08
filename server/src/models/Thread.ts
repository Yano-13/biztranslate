import mongoose, { Schema, Document } from 'mongoose';

export interface IThread extends Document {
  title: string;
  platform: 'chat' | 'email';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  participants: string[];
  tags: string[];
  isArchived: boolean;
}

const ThreadSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    platform: {
      type: String,
      enum: ['chat', 'email'],
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    participants: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// インデックス作成
ThreadSchema.index({ createdAt: -1 });
ThreadSchema.index({ lastMessageAt: -1 });
ThreadSchema.index({ platform: 1 });
ThreadSchema.index({ isArchived: 1 });

export default mongoose.model<IThread>('Thread', ThreadSchema);

// Made with Bob
