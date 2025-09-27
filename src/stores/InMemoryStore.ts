import type { IRecordStore } from "./IRecordStore";

export class InMemoryStore<T> {
  private store: Map<string, IRecordStore<T>> = new Map();
  private ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) {
    // Default TTL is 5 minutes
    this.ttl = ttl;
  }
  public set(key: string, value: T): void {
    const record: IRecordStore<T> = {
      value,
      createdAt: Date.now(),
    };
    this.store.set(key, record);
  }

  public get(key: string): T | null {
    const record = this.store.get(key);
    if (!record) return null;

    if (Date.now() - record.createdAt > this.ttl) {
      this.store.delete(key);
      return null;
    }
    return record ? record.value : null;
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }
}
