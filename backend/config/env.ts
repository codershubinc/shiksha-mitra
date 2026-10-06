import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Also load from current working directory as a fallback
dotenv.config();

export const config = {
  port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    tableName: process.env.DYNAMODB_TABLE_NAME || 'ShikshaMitra-Records',
  },
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shiksha-mitra',
};
