import { Hono } from "hono";
import { exchangeCodeForToken } from "../services/TokenServices";
import { generateState } from "../helpers/Auth";
import { InMemoryStore } from "../stores/InMemoryStore";

export const ClickupRouter = new Hono();

interface WorkspaceState {
  state: string;
  createdAt: number;
}

interface IClickupAuthResponse {
  access_token: string;
  token_type: string;
}

const stateStore = new InMemoryStore<WorkspaceState>();
export const tokenStore = new InMemoryStore<IClickupAuthResponse>();

ClickupRouter.get("/auth", async (c) => {
  console.log("Clickup auth endpoint hit");
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
    const authResponse: IClickupAuthResponse = {
      access_token: token,
      token_type: "Bearer",
    };
    tokenStore.set("token", authResponse);
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
  stateStore.set(state, { state, createdAt: Date.now() });
  const authUrl = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
  return c.redirect(authUrl);
});
