import Redis from "ioredis";
export class RedisStore<T> {
  private redis: Redis;
  private ttl: number;

  constructor(ttl: number = 300) {
    this.redis = new Redis({
      host: Bun.env.REDIS_HOST!,
      port: Number(Bun.env.REDIS_PORT),
      username: Bun.env.REDIS_USERNAME,
      password: Bun.env.REDIS_PASSWORD,
    });
    this.ttl = ttl;
  }

  async set(key: string, value: T) {
    const val = JSON.stringify(value);
    if (this.ttl > 0) {
      await this.redis.set(key, val, "EX", this.ttl);
    } else {
      await this.redis.set(key, val); // No expiration
    }
  }

  async get(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data as string) as T;
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}
