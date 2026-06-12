import * as fc from 'fast-check';
import { LoggingInterceptor } from '@shared/infrastructure/logging/logging.interceptor';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { NotFoundException } from '@shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';
import { ConflictException } from '@shared/domain/exceptions/conflict.exception';
import { BusinessRuleException } from '@shared/domain/exceptions/business-rule.exception';
import { DomainException } from '@shared/domain/exceptions/domain.exception';

/**
 * Captures stdout writes to inspect emitted log entries.
 */
function captureStdout(fn: () => void): string[] {
  const lines: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    lines.push(chunk.toString());
    return true;
  }) as typeof process.stdout.write;

  try {
    fn();
  } finally {
    process.stdout.write = originalWrite;
  }
  return lines;
}

async function captureStdoutAsync(fn: () => Promise<void>): Promise<string[]> {
  const lines: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    lines.push(chunk.toString());
    return true;
  }) as typeof process.stdout.write;

  try {
    await fn();
  } finally {
    process.stdout.write = originalWrite;
  }
  return lines;
}

/**
 * Creates a fake ExecutionContext that simulates an HTTP request
 * with the given method, path, and status code.
 */
function createFakeExecutionContext(
  method: string,
  path: string,
  statusCode: number,
): { context: ExecutionContext; next: CallHandler } {
  const request = { method, url: path };
  const response = { statusCode };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
    getType: () => 'http',
  } as unknown as ExecutionContext;

  const next: CallHandler = {
    handle: () => of({ result: 'ok' }),
  };

  return { context, next };
}

function createFakeExecutionContextWithError(
  method: string,
  path: string,
  statusCode: number,
  error: Error,
): { context: ExecutionContext; next: CallHandler } {
  const request = { method, url: path };
  const response = { statusCode };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
    getType: () => 'http',
  } as unknown as ExecutionContext;

  const next: CallHandler = {
    handle: () => throwError(() => error),
  };

  return { context, next };
}

// --- Generators ---

const httpMethodArb = fc.constantFrom('GET', 'POST', 'PATCH', 'DELETE', 'PUT');
const pathArb = fc.stringOf(
  fc.constantFrom(
    '/',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '-', '_',
  ),
  { minLength: 1, maxLength: 50 },
).map((s) => '/' + s);
const statusCodeArb = fc.integer({ min: 100, max: 599 });
const exceptionArbWithStatusCode = fc.oneof(
  fc.constantFrom({ statusCode: 400, error: new ValidationException("message", { field: 'field', constraint: 'constraint' }) }),
  fc.constantFrom({ statusCode: 404, error: new NotFoundException("message", { field: 'field' }) }),
  fc.constantFrom({ statusCode: 409, error: new ConflictException("message", { field: 'field' }) }),
  fc.constantFrom({ statusCode: 422, error: new BusinessRuleException("message", { rule: 'rule' }) }),
  fc.constantFrom({ statusCode: 500, error: new Error("Generic error") as unknown as DomainException }),
);
// const exceptionArbWithStatusCode = fc.constantFrom(new Map([
//   [400, new ValidationException("message", { field: 'field', constraint: 'constraint' })],
//   [404, new NotFoundException("message", { field: 'field' })],
//   [409, new ConflictException("message", { field: 'field' })],
//   [422, new BusinessRuleException("message", { rule: 'rule' })],
//   [500, new Error("Generic error") as unknown as DomainException],
// ]));

// --- Property Tests ---

describe('Property Tests — Observability', () => {
  describe('Property 16: Formato de log estruturado', () => {
    /**
     * Validates: Requirements 8.1
     *
     * For any HTTP request (any method from GET/POST/PATCH/DELETE/PUT,
     * any path string, any status code), when processed by the logging
     * interceptor, the emitted log entry must be valid JSON containing
     * exactly these fields:
     * - timestamp (ISO 8601)
     * - level (string)
     * - method (HTTP method)
     * - path (string)
     * - status_code (number)
     * - duration_ms (number >= 0)
     */
    it('for any successful HTTP request, interceptor emits JSON log with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpMethodArb,
          pathArb,
          statusCodeArb,
          async (method, path, statusCode) => {
            // Arrange
            const logger = new LoggerService();
            const interceptor = new LoggingInterceptor(logger);
            const { context, next } = createFakeExecutionContext(method, path, statusCode);

            // Act
            const lines = await captureStdoutAsync(async () => {
              const observable = interceptor.intercept(context, next);
              await observable.toPromise();
            });

            // Assert — at least one log line emitted
            expect(lines.length).toBeGreaterThanOrEqual(1);

            const logLine = lines[lines.length - 1]!.trim();
            expect(logLine.length).toBeGreaterThan(0);

            // Must be valid JSON
            const parsed = JSON.parse(logLine);

            // Required fields present
            expect(parsed).toHaveProperty('timestamp');
            expect(parsed).toHaveProperty('level');
            expect(parsed).toHaveProperty('method');
            expect(parsed).toHaveProperty('path');
            expect(parsed).toHaveProperty('status_code');
            expect(parsed).toHaveProperty('duration_ms');

            // Type validation
            expect(typeof parsed.timestamp).toBe('string');
            expect(typeof parsed.level).toBe('string');
            expect(typeof parsed.method).toBe('string');
            expect(typeof parsed.path).toBe('string');
            expect(typeof parsed.status_code).toBe('number');
            expect(typeof parsed.duration_ms).toBe('number');

            // timestamp must be ISO 8601
            const date = new Date(parsed.timestamp);
            expect(date.toISOString()).toBe(parsed.timestamp);

            // method and path match input
            expect(parsed.method).toBe(method);
            expect(parsed.path).toBe(path);

            // duration_ms must be non-negative
            expect(parsed.duration_ms).toBeGreaterThanOrEqual(0);

            // level must be a known value
            expect(['info', 'warn', 'error', 'debug']).toContain(parsed.level);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('for any HTTP request that results in error, interceptor emits JSON log with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          httpMethodArb,
          pathArb,
          exceptionArbWithStatusCode,
          async (method, path, { statusCode, error }) => {
            // Arrange
            const logger = new LoggerService();
            const interceptor = new LoggingInterceptor(logger);
            const { context, next } = createFakeExecutionContextWithError(method, path, statusCode, error);

            // Act
            const lines = await captureStdoutAsync(async () => {
              const observable = interceptor.intercept(context, next);
              try {
                await observable.toPromise();
              } catch {
                // Expected — errors propagate through the observable
              }
            });

            // Assert — at least one log line emitted
            expect(lines.length).toBeGreaterThanOrEqual(1);

            const logLine = lines[lines.length - 1]!.trim();
            expect(logLine.length).toBeGreaterThan(0);

            // Must be valid JSON
            const parsed = JSON.parse(logLine);

            // Required fields present
            expect(parsed).toHaveProperty('timestamp');
            expect(parsed).toHaveProperty('level');
            expect(parsed).toHaveProperty('method');
            expect(parsed).toHaveProperty('path');
            expect(parsed).toHaveProperty('status_code');
            expect(parsed).toHaveProperty('duration_ms');

            // Type validation
            expect(typeof parsed.timestamp).toBe('string');
            expect(typeof parsed.level).toBe('string');
            expect(typeof parsed.method).toBe('string');
            expect(typeof parsed.path).toBe('string');
            expect(typeof parsed.status_code).toBe('number');
            expect(typeof parsed.duration_ms).toBe('number');

            // timestamp must be ISO 8601
            const date = new Date(parsed.timestamp);
            expect(date.toISOString()).toBe(parsed.timestamp);

            // method and path match input
            expect(parsed.method).toBe(method);
            expect(parsed.path).toBe(path);

            // status_code matches the error status
            expect(parsed.status_code).toBe(statusCode);

            // duration_ms must be non-negative
            expect(parsed.duration_ms).toBeGreaterThanOrEqual(0);

            // level should be 'error' for error responses
            expect(parsed.level).toBe('error');
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
