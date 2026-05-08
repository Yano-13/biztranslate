import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  direction: 'incoming' | 'outgoing';
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  targetLanguage: string;
  platform: 'chat' | 'email';
  formattedText?: string;
  suggestions?: string[];
  createdAt: Date;
  metadata: {
    tone?: 'formal' | 'casual';
    confidence?: number;
  };
}

const MessageSchema: Schema = new Schema(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    originalLanguage: {
      type: String,
      required: true,
      default: 'en',
    },
    translatedText: {
      type: String,
      required: true,
    },
    targetLanguage: {
      type: String,
      required: true,
      default: 'ja',
    },
    platform: {
      type: String,
      enum: ['chat', 'email'],
      required: true,
    },
    formattedText: {
      type: String,
    },
    suggestions: {
      type: [String],
      default: [],
    },
    metadata: {
      tone: {
        type: String,
        enum: ['formal', 'casual'],
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

// インデックス作成
MessageSchema.index({ threadId: 1, createdAt: -1 });
MessageSchema.index({ direction: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

// Made with Bob
