import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ExceptionResponseMapper } from '@shared/domain/exceptions/mapper';
import { clsStore } from '@shared/infrastructure/logging/cls.store';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = ExceptionResponseMapper.buildErrorResponse(exception);
    const correlationId = clsStore.getStore()?.correlationId;

    response.status(errorResponse.statusCode).json({
      ...errorResponse,
      ...(correlationId ? { correlation_id: correlationId } : {}),
    });
  }
}
