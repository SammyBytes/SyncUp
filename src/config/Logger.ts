import pino from "pino";

export const logger = pino({
  level: Bun.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    Bun.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: { colorize: true },
        },
});
