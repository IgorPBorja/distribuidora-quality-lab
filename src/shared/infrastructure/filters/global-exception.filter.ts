import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionResponseMapper } from '@shared/domain/exceptions/mapper';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = ExceptionResponseMapper.buildErrorResponse(exception);

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
