import { Hono } from "hono";
import { exchangeCodeForToken } from "../services/TokenServices";
import { generateState } from "../helpers/Auth";
import { InMemoryStore } from "../stores/InMemoryStore";
import { RedisStore } from "../stores/RedisStore";
import { GenerateAuthUrlUseCase } from "../useCases/clickup/GenerateAuthUrlUseCase";

export const ClickupRouter = new Hono();
const stateStore = new RedisStore<{ state: string }>(
  300 // 5 min
);

const tokenStore = new RedisStore<{ accessToken: string }>(
  0 // No expiration
);
ClickupRouter.get("/auth", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json({ message: "Missing code parameter" }, 400);
  }

  const state = c.req.query("state");
  if (!state) {
    return c.json({ message: "Missing state parameter" }, 400);
  }

  const storedState = stateStore.get(state);
  if (!storedState) {
    return c.json({ message: "Invalid or expired state parameter" }, 400);
  }
  // Once used, remove the state to prevent reuse
  stateStore.delete(state);

  try {
    const token = await exchangeCodeForToken(code);
    await tokenStore.set("clickup_token", { accessToken: token });
    return c.json({ message: "Clickup connected successfully!" });
  } catch (error) {
    console.error("Error during Clickup OAuth process:", error);
    return c.json({ message: "Internal server error" }, 500);
  }

  return c.json({ message: "Clickup Router works!" });
});

ClickupRouter.get("/connect", (c) => {
  try {
    const result = GenerateAuthUrlUseCase.execute();
    if (result.ok === false) {
      return c.json(result.error, result.error.status);
    }
    return c.redirect(result.value);
  } catch (error) {
    console.error("Error generating Clickup auth URL:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});
