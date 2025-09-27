import { Hono } from "hono";
import { exchangeCodeForToken } from "../services/TokenServices";
import { generateState } from "../helpers/Auth";
import { InMemoryStore } from "../stores/InMemoryStore";
import { RedisStore } from "../stores/RedisStore";

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
  const state = generateState();
  const clientId = Bun.env.CLICKUP_ID_CLIENT;
  const redirectUri = encodeURIComponent(
    "http://localhost:1234/api/v1/clickup/auth"
  );

  if (!clientId) {
    return c.json({ message: "Client ID not configured" }, 500);
  }
  stateStore.set(state, { state });
  const authUrl = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
  return c.redirect(authUrl);
});
