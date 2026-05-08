import { Router } from 'express';
import threadRoutes from './thread.routes';
import translationRoutes from './translation.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'BizTranslate API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/threads', threadRoutes);
router.use('/translations', translationRoutes);

export default router;

// Made with Bob
