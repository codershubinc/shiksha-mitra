import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const app = express();
export const httpServer = http.createServer(app);

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
    architecture: 'Modular Full-Stack Enterprise Pattern',
    port: config.port,
  });
});

export async function startServer() {
  const isProduction =
    config.nodeEnv === 'production' ||
    (process.env.NODE_ENV === 'production') ||
    (!process.env.NODE_ENV && fs.existsSync(path.join(rootDir, 'dist', 'index.html')));

  if (!isProduction) {
    // In development mode, mount Vite middleware with HMR bound to HTTP server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
      configFile: path.join(rootDir, 'vite.config.ts'),
      root: path.join(rootDir, 'frontend'),
    });

    app.use(vite.middlewares);

    // Official Vite HTML transformation middleware for SPA routing
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.join(rootDir, 'frontend', 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // In production mode, serve pre-built static bundle from dist
    const distPath = path.join(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(
      `[Shiksha Mitra AI] Modular full-stack backend running on http://localhost:${config.port} (${isProduction ? 'production' : 'development'})`
    );
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('[Shiksha Mitra AI] Failed to start server:', err);
  });
}
