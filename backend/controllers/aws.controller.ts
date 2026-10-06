import { Request, Response } from 'express';
import { dynamoService } from '../services/dynamodb.service.js';
import { UserModel } from '../models/user.model.js';
import { sanitizeUser } from '../utils/crypto.utils.js';

export const awsController = {
  async getStatus(_req: Request, res: Response) {
    try {
      const status = await dynamoService.getStatus();
      return res.json(status);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async testConnection(_req: Request, res: Response) {
    try {
      const testResult = await dynamoService.testConnection();
      return res.json(testResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getRecords(req: Request, res: Response) {
    try {
      const { pk } = req.query;
      if (pk && typeof pk === 'string') {
        const records = await dynamoService.queryByPartition(pk);
        return res.json({ records });
      }
      const allRecords = await dynamoService.scanAll();
      return res.json({ records: allRecords });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async saveRecord(req: Request, res: Response) {
    try {
      const { PK, SK, recordType, data } = req.body;
      if (!PK || !SK) {
        return res.status(400).json({ error: 'PK and SK are required partition keys' });
      }
      const result = await dynamoService.putRecord({
        PK,
        SK,
        recordType: recordType || 'user_profile',
        data: data || {},
        timestamp: new Date().toISOString(),
      });
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async syncData(_req: Request, res: Response) {
    try {
      let syncedCount = 0;
      const users = await UserModel.find().lean();
      for (const user of users) {
        await dynamoService.putRecord({
          PK: `USER#${user.id}`,
          SK: 'PROFILE',
          recordType: 'user_profile',
          data: sanitizeUser(user),
          timestamp: new Date().toISOString(),
        });
        syncedCount++;
      }

      return res.json({
        success: true,
        syncedCount,
        message: `Successfully synchronized ${syncedCount} student profiles into AWS DynamoDB table '${dynamoService.tableName}'.`,
        tableName: dynamoService.tableName,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};
