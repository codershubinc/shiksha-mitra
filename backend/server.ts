import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
export const httpServer = http.createServer(app);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Mount Central API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Shiksha Mitra AI Backend',
    architecture: 'Modular Full-Stack Enterprise Pattern',
    port: config.port,
  });
});

export async function startServer() {
  const isProduction =
    config.nodeEnv === 'production' ||
    (process.env.NODE_ENV === 'production')

  if (!isProduction) {
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
    });
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Shiksha Mitra AI] Connected to MongoDB');
  } catch (error) {
    console.error('[Shiksha Mitra AI] MongoDB connection error:', error);
  }

  return httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(
      `[Shiksha Mitra AI] backend running on http://localhost:${config.port} (${isProduction ? 'production' : 'development'})`
    );
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('[Shiksha Mitra AI] Failed to start server:', err);
  });
}
