# Shiksha Mitra AI

AI-Powered Socratic Mentor, Real-Time Voice Teacher Agent, and Classroom Analytics Platform.

---

## Architecture

- **`frontend/`**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Lucide Icons
- **`backend/`**: Modular Node.js Express server with standard controller/service/routes layout:
  - `backend/routes/`: Route definitions (`/api/ai/*`, `/api/auth/*`, `/api/students/*`, etc.)
  - `backend/controllers/`: Express controllers handling request/response logic
  - `backend/services/`: Core business logic & Gemini AI / TTS / database integrations
  - `backend/models/`: Data types and schemas
  - `backend/config/`: Environment configuration

---

## Quick Start (Local Run)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env` and configure your API keys (e.g., `GEMINI_API_KEY`, `PORT`):
```bash
cp .env.example .env
```

---

## Running the Application

### Option A: Recommended (Unified Full-Stack)
Runs both the backend Express API and the Vite frontend with Hot Module Replacement in a single unified process on **port 3000**:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Separate Frontend & Backend

#### Terminal 1 — Backend API (Port 3000):
```bash
npm run dev:server
```

#### Terminal 2 — Frontend Dev Server (Port 5173 with auto `/api` proxy):
```bash
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Requests to `/api/*` will automatically proxy to `http://localhost:3000`.

---

## Production Build & Start

To build optimized assets for production deployment:
```bash
npm run build
npm start
```
- `npm run build` compiles the frontend to `dist/` and bundles the backend with `esbuild`.
- `npm start` serves the full-stack application on `http://localhost:3000`.

---

## Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run full-stack application (frontend + backend) on `http://localhost:3000` |
| `npm run dev:server` | Run only the backend Express API server |
| `npm run dev:frontend` | Run only the Vite frontend dev server with API proxy |
| `npm run build` | Build both frontend and backend for production |
| `npm run build:frontend`| Build only the frontend assets into `dist/` |
| `npm run build:server`  | Bundle only the backend into `backend/server.js` |
| `npm start` | Start the production server |
| `npm run lint` | Typecheck TypeScript files across the codebase |
| `npm run clean` | Clean up build artifacts |
