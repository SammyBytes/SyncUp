import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
export const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 min
  limit: 10, // 10 requests per windowMs

  keyGenerator: (c) => {
    return (
      c.req.header("x-forwarded-for") ??
      c.req.header("cf-connecting-ip") ??
      getConnInfo(c).remote.address ??
      "unknown"
    );
  },
  handler: async (c) => {
    return c.json(
      { message: "Too many requests, please try again later." },
      429
    );
  },
});
