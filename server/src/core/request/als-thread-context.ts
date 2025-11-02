import { AsyncLocalStorage } from 'node:async_hooks';

export class AlsThreadContext {
  private readonly als = new AsyncLocalStorage<Map<string, any>>();

  run<T>(run: () => Promise<T>): Promise<T> {
    const threadId = Math.random().toString(32).substring(2);

    return this.als.run(new Map([['threadId', threadId]]), run);
  }

  get<T>(key: string): T | undefined {
    return this.als.getStore()?.get(key);
  }

  set<T>(key: string, value: T) {
    this.als.getStore()?.set(key, value);
  }
}
