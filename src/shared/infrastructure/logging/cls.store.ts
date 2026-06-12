import { AsyncLocalStorage } from 'async_hooks';

export interface ClsStore {
  correlationId: string;
}

export const clsStore = new AsyncLocalStorage<ClsStore>();