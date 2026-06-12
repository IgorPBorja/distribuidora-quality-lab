import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { clsStore } from './cls.store';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  correlation_id?: string;
  level: LogLevel;
  method?: string;
  path?: string;
  status_code?: number;
  duration_ms?: number;
  message?: string;
  [key: string]: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string, extra?: Record<string, unknown>): void {
    this.emit('info', message, context, extra);
  }

  error(message: string, trace?: string, context?: string, extra?: Record<string, unknown>): void {
    this.emit('error', message, context, { trace, ...extra });
  }

  warn(message: string, context?: string, extra?: Record<string, unknown>): void {
    this.emit('warn', message, context, extra);
  }

  debug(message: string, context?: string, extra?: Record<string, unknown>): void {
    this.emit('debug', message, context, extra);
  }

  verbose(message: string, context?: string, extra?: Record<string, unknown>): void {
    this.emit('debug', message, context, extra);
  }

  logRequest(entry: Omit<LogEntry, 'timestamp'>): void {
    const output = {
      timestamp: new Date().toISOString(),
      correlation_id: clsStore.getStore()?.correlationId,
      ...entry,
    };
    process.stdout.write(JSON.stringify(output) + '\n');
  }

  private emit(
    level: LogLevel,
    message: string,
    context?: string,
    extra?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      correlation_id: clsStore.getStore()?.correlationId,
      level,
      message,
      ...(context ? { context } : {}),
      ...(extra || {}),
    };
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}
