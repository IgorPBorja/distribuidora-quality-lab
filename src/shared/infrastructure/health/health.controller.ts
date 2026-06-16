import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response) {
    let dbStatus: 'up' | 'down' = 'up';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      dbStatus = 'down';
    }

    const status = dbStatus === 'up' ? 'ok' : 'degraded';
    if (dbStatus === 'down') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { status, db: dbStatus, timestamp: new Date().toISOString() };
  }
}
