import { z } from "zod";
/**
 * Environment variables validation schema.
 * All variables are required except PORT which defaults to 1234.
 */
const envSchema = z.object({
  PORT: z.number().default(1234),
  HOST: z.string().min(1).default("http://localhost"),
  CLICKUP_ID_CLIENT: z.string().min(1),
  CLICKUP_CLIENT_SECRET: z.string().min(1),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.number().min(1).default(6379),
  REDIS_USERNAME: z.string().min(1).default("default"),
  REDIS_PASSWORD: z.string().min(1).default("12345"),

  WEBHOOK_SECRET: z.string().min(1).default("supersecret"),
});
/**
 * Parsed and validated environment variables.
 * Application will exit if validation fails.
 */
const _env = await envSchema.safeParseAsync(Bun.env);

// Exit the process if environment variables are invalid
if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.format());
  process.exit(1);
}
/**
 * Exported validated environment variables.
 * Use `env.VARIABLE_NAME` to access individual variables.
 */
export const env = _env.data;
