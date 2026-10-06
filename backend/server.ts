import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Mount Central API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Shiksha Mitra AI Backend',
    architecture: 'Modular Enterprise Controller-Service-Route Pattern',
    awsIntegrated: true,
  });
});

export async function startServer() {
  if (config.nodeEnv !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      configFile: path.join(rootDir, 'vite.config.ts'),
      root: path.join(rootDir, 'frontend'),
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
  }

  return app.listen(config.port, '0.0.0.0', () => {
    console.log(`[Shiksha Mitra AI] Modular full-stack backend running on http://0.0.0.0:${config.port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
