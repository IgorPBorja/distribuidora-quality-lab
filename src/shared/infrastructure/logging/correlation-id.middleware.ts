import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { clsStore } from './cls.store';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.header('x-correlation-id') || uuidv4()) as string;

    res.setHeader('x-correlation-id', correlationId);

    clsStore.run({ correlationId }, () => {
      next();
    });
  }
}