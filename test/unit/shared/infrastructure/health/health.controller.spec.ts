import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { HealthController } from '@shared/infrastructure/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockDataSource: { query: jest.Mock };
  let mockRes: { status: jest.Mock };

  beforeEach(() => {
    mockDataSource = { query: jest.fn() };
    mockRes = { status: jest.fn() };
    controller = new HealthController(mockDataSource as unknown as DataSource);
  });

  describe('GET /health', () => {
    it('returns status ok and db up when database is reachable', async () => {
      mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check(mockRes as unknown as Response);

      expect(result.status).toBe('ok');
      expect(result.db).toBe('up');
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('returns status degraded, db down, and HTTP 503 when database is unreachable', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.check(mockRes as unknown as Response);

      expect(result.status).toBe('degraded');
      expect(result.db).toBe('down');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('always includes a timestamp in ISO 8601 format', async () => {
      mockDataSource.query.mockResolvedValue([]);

      const result = await controller.check(mockRes as unknown as Response);

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});
