import { HttpException, HttpStatus } from '@nestjs/common';
import {
  DomainException,
  ValidationException,
  NotFoundException,
  ConflictException,
  BusinessRuleException,
} from '@shared/domain/exceptions';

export interface ErrorResponse {
  statusCode: number;
  error: string;
  stack: string | undefined;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class ExceptionResponseMapper {
  static buildErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof ValidationException) {
      return ExceptionResponseMapper.buildDomainErrorResponse(exception, HttpStatus.BAD_REQUEST, 'Bad Request');
    }

    if (exception instanceof NotFoundException) {
      return ExceptionResponseMapper.buildDomainErrorResponse(exception, HttpStatus.NOT_FOUND, 'Not Found');
    }

    if (exception instanceof ConflictException) {
      return ExceptionResponseMapper.buildDomainErrorResponse(exception, HttpStatus.CONFLICT, 'Conflict');
    }

    if (exception instanceof BusinessRuleException) {
      return ExceptionResponseMapper.buildDomainErrorResponse(
        exception,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Unprocessable Entity',
      );
    }

    if (exception instanceof DomainException) {
      return ExceptionResponseMapper.buildDomainErrorResponse(
        exception,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Unprocessable Entity',
      );
    }

    if (exception instanceof HttpException) {
      return ExceptionResponseMapper.buildHttpExceptionResponse(exception);
    }

    return ExceptionResponseMapper.buildInternalErrorResponse();
  }

  private static buildDomainErrorResponse(
    exception: DomainException,
    statusCode: number,
    error: string,
  ): ErrorResponse {
    const response: ErrorResponse = {
      statusCode,
      error,
      message: exception.message,
      stack: exception.stack,
      timestamp: new Date().toISOString(),
    };

    if (exception.details) {
      response.details = exception.details;
    }

    return response;
  }

  private static buildHttpExceptionResponse(exception: HttpException): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const response: ErrorResponse = {
      statusCode: status,
      error: ExceptionResponseMapper.getHttpErrorName(status),
      message: '',
      stack: undefined,
      timestamp: new Date().toISOString(),
    };

    if (typeof exceptionResponse === 'string') {
      response.message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const body = exceptionResponse as Record<string, unknown>;
      response.message = (body['message'] as string) ?? 'An error occurred';

      if (Array.isArray(body['message'])) {
        response.message = 'Validation failed';
        response.details = { errors: body['message'] as unknown as Record<string, unknown> };
      }
    }

    return response;
  }

  private static buildInternalErrorResponse(): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      stack: undefined,
      timestamp: new Date().toISOString(),
    };
  }

  private static getHttpErrorName(status: number): string {
    const names: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return names[status] ?? 'Error';
  }
}