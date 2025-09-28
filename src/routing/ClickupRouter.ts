import { Hono } from "hono";
import { exchangeCodeForToken } from "../services/TokenServices";
import { generateState } from "../helpers/Auth";
import { InMemoryStore } from "../stores/InMemoryStore";
import { RedisStore } from "../stores/RedisStore";
import { GenerateAuthUrlUseCase } from "../useCases/clickup/GenerateAuthUrlUseCase";
import { ConnectClickUpAccountUseCase } from "../useCases/clickup/ConnectClickUpAccountUseCase";
import { logger } from "../config/Logger";

export const ClickupRouter = new Hono();

ClickupRouter.get("/auth", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  const result = await ConnectClickUpAccountUseCase.execute(code, state);

  if (result.ok === false) {
    return c.json(result.error, result.error.status);
  }
  return c.json(result.value);
});

ClickupRouter.get("/connect", (c) => {
  try {
    const result = GenerateAuthUrlUseCase.execute();
    if (result.ok === false) {
      return c.json(result.error, result.error.status);
    }
    const url = result.value;
    logger.info(`Generated Clickup auth URL: ${url}`);
    return c.redirect(url);
  } catch (error) {
    logger.error(`yError generating Clickup auth URL: ${error}`);
    return c.json({ message: "Internal server error" }, 500);
  }
});
