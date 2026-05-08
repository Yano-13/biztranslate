import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import routes from './routes';

// 環境変数の読み込み
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア設定
app.use(helmet()); // セキュリティヘッダー
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // ログ出力

// レート制限
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 最大100リクエスト
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ルート設定
app.use('/api', routes);

// ルートエンドポイント
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to BizTranslate API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      threads: '/api/threads',
      translations: '/api/translations',
    },
  });
});

// 404エラーハンドリング
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// エラーハンドリングミドルウェア
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// サーバー起動
let server: any;

const startServer = async () => {
  try {
    // データベース接続
    await connectDatabase();
    
    // サーバー起動
    server = app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 BizTranslate API Server`);
      console.log(`📡 Running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Docs: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  
  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      // MongoDBの接続を閉じる
      try {
        const mongoose = await import('mongoose');
        await mongoose.default.connection.close();
        console.log('✅ MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
      
      process.exit(0);
    });

    // 強制終了のタイムアウト（10秒）
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未処理の例外をキャッチ
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// サーバー起動
startServer();

export default app;

// Made with Bob
